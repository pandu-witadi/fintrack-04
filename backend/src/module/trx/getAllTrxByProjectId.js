const { Trx } = require('../../model/index')
const AppError = require('../../util/appError')

const getAllTrxByProjectId = async (request, reply) => {
    try {
        const { projectId } = request.params
        
        if (!projectId) {
            throw new AppError('Please provide projectId', 400)
        }

        const trxs = await Trx.find({ project: projectId })
        .sort({ createdAt: -1 })
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
            select: '_id active name typ amount done dateEx project assignee',
            populate: [
                {
                    path: 'project',
                    select: '_id name'
                },
                {
                    path: 'assignee',
                    select: '_id name'
                }
            ]
        })
        .lean({ virtuals: true })

        // Transform the data after population (instead of using options.transform which doesn't work with lean)
        const transformedTrxs = trxs.map(trx => {
            // Transform lActual items
            if (trx.lActual && Array.isArray(trx.lActual)) {
                trx.lActual = trx.lActual.map((actual) => {
                    const transformed = {
                        _id: actual._id.toString(),
                        active: actual.active,
                        name: actual.name,
                        typ: actual.typ,
                        amount: actual.amount,
                        done: actual.done,
                        dateEx: actual.dateEx
                    }
                    if (actual.project) {
                        transformed.projectId = actual.project._id.toString()
                        transformed.projectName = actual.project.name
                    }
                    if (actual.assignee) {
                        transformed.assigneeId = actual.assignee._id.toString()
                        transformed.assigneeName = actual.assignee.name
                    }
                    return transformed
                })
            }
            trx._id = trx._id.toString()
            return trx
        })

        return {
            success: true,
            pyd: transformedTrxs
        }
    } catch (error) {
        if (error.kind === 'ObjectId') {
            throw new AppError('Invalid project ID', 400)
        }
        console.log(error)
        throw new AppError('Failed to fetch transactions', 500)
    }
}

module.exports = getAllTrxByProjectId