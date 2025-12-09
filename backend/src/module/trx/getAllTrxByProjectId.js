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

        trxs.forEach(trx => {
            trx._id = trx._id.toString()
        })

        return {
            success: true,
            pyd: trxs
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