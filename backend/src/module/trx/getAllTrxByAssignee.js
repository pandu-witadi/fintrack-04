const { Trx } = require('../../model/index')
const AppError = require('../../util/appError')

const getAllTrxByAssignee = async (request, reply) => {
    try {
        // Check if assignee ID is provided
        const { assigneeId } = request.params
        if (!assigneeId) {
            throw new AppError('Assignee ID is required', 400)
        }
        console.log(assigneeId)

        const trxs = await Trx.find({ assignee: assigneeId })
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
            select: '_id name amount typ done dateEx'
        })
        .lean({ virtuals: true })

        trxs.forEach(trx => {
            trx._id = trx._id.toString()
            // Remove lActual if it's null or empty
            if (!trx.lActual || trx.lActual.length === 0) {
                delete trx.lActual
            }
        })

        return {
            success: true,
            pyd: trxs
        }
    } catch (error) {
        console.log(error)
        throw new AppError('Failed to fetch trxs for assignee', 500)
    }
}

module.exports = getAllTrxByAssignee
