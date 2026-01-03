const { Trx, Project } = require('../../model/index')
const AppError = require('../../util/appError')

const registerTrx = async (request, reply) => {
    try {
        // check parameters
        const { name, projectId, amount, dateEx, ...otherKeys } = request.body
        if (!name || !projectId || amount === undefined || amount === null || !dateEx) {
            throw new AppError('Please provide name, projectId, amount, and dateEx', 400)
        }

        // check if project exists
        let project = await Project.findById(projectId)
        if (!project) {
            throw new AppError('Project not found', 404)
        }

        // if otherKeys contains isEq
        if (otherKeys.isEq !== undefined) {
            // isEq is true, set actAmount = amount
            if (otherKeys.isEq === true) {
                otherKeys.actAmount = amount
            } 
            // else proceed with different actAmount
        }

        const trx = await Trx.create({
            name: name,
            project: projectId,
            amount: amount || 0,
            dateEx: dateEx,
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

        return {
            success: true,
            pyd: populatedTrx
        }
    } catch (error) {
        if (error.kind === 'ObjectId') {
            throw new AppError('Invalid project ID', 400)
        }
        if (error.name === 'ValidationError') {
            throw new AppError(error.message, 400)
        }
        throw new AppError(error.message || 'Failed to register transaction', error.statusCode || 500)
    }
}

module.exports = registerTrx