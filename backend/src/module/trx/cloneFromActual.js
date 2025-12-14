const { Trx, Actual, Project } = require('../../model/index')
const AppError = require('../../util/appError')

const cloneFromActual = async (request, reply) => {
    try {
        // check parameters
        const { name, actualId, amount, dateEx, ...otherKeys } = request.body
        if (!actualId ) {
            throw new AppError('Please provide actualId', 400)
        }

        // check if actual exists
        let actual = await Actual.findById(actualId)
        if (!actual) {
            throw new AppError('Actual not found', 404)
        }

        if (!actual.project) {
            throw new AppError('Actual project not found', 400)
        }
        let project = await Project.findById(actual.project)
        
        const trx = await Trx.create({
            name: actual.name,
            actual: actualId,
            project: actual.project.toString(),
            amount: actual.amount,
            dateEx: actual.dateEx,
            typ: actual.typ,
            updatedBy: request.user._id,
            ...otherKeys
        })

        // Update project.lTrx, make sure no duplicate trx
        if (!project.lTrx || !project.lTrx.includes(trx._id)) {
            if (!project.lTrx) 
                project.lTrx = []
            project.lTrx.push(trx._id)
            await project.save()
        }
        
        // Update actual.trx, link the transaction to the actual
        actual.trx = trx._id
        await actual.save()
        
        // Add actual to trx.lActual
        trx.lActual.push(actual._id)
        await trx.save()
        
        const populatedTrx = await Trx.findById(trx._id)
        .populate({
            path: 'project',
            select: '_id name code'
        })
        .populate({
            path: 'updatedBy',
            select: '_id name email'
        })
        .populate({
            path: 'assignee',
            select: '_id name email'
        })
        .populate({
            path: 'lActual',
            select: '_id name typ amount done',
            options: {
                transform: (doc) => {
                    if (doc) {
                        doc._id = doc._id.toString()
                    }
                    return doc
                }
            }
        })
        .lean({ virtuals: true })

        return {
            success: true,
            pyd: populatedTrx
        }
    } catch (error) {
        if (error.kind === 'ObjectId') {
            throw new AppError('Invalid actual ID', 400)
        }
        if (error.name === 'ValidationError') {
            throw new AppError(error.message, 400)
        }
        throw new AppError(error.message || 'Failed to clone from actual', error.statusCode || 500)
    }
}

module.exports = cloneFromActual