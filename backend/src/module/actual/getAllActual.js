const { Actual } = require('../../model/index')
const AppError = require('../../util/appError')

const getAllActual = async (request, reply) => {
    try {
        const actuals = await Actual.find({})
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
            select: '_id name amount'
        })
        .lean({ virtuals: true })

        actuals.forEach(actual => {
            actual._id = actual._id.toString()
        })

        return {
            success: true,
            pyd: actuals
        }
    } catch (error) {
        console.log(error)
        throw new AppError('Failed to fetch actuals', 500)
    }
}

module.exports = getAllActual
