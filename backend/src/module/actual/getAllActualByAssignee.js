const { Actual } = require('../../model/index')
const AppError = require('../../util/appError')

const getAllActualByAssignee = async (request, reply) => {
    try {
        // Check if assignee ID is provided
        const { assigneeId } = request.params
        if (!assigneeId) {
            throw new AppError('Assignee ID is required', 400)
        }
        console.log(assigneeId)

        const actuals = await Actual.find({ assignee: assigneeId })
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
            path: 'budget',
            select: '_id name amount'
        })
        .populate({
            path: 'trx',
            select: '_id name amount typ done'
        })
        .lean({ virtuals: true })

        actuals.forEach(actual => {
            actual._id = actual._id.toString()
            // Remove trx if it's null
            if (!actual.trx) {
                delete actual.trx
            }
        })

        return {
            success: true,
            pyd: actuals
        }
    } catch (error) {
        console.log(error)
        throw new AppError('Failed to fetch actuals for assignee', 500)
    }
}

module.exports = getAllActualByAssignee
