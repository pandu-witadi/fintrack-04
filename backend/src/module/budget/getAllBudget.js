const { Budget } = require('../../model/index')
const AppError = require('../../util/appError')

const getAllBudget = async (request, reply) => {
    try {
        const budgets = await Budget.find({})
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
                path: 'lActual',
                select: '_id name',
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

        budgets.forEach(budget => {
            budget._id = budget._id.toString()
        })

        return {
            success: true,
            pyd: budgets
        }
    } catch (error) {
        console.log(error)
        throw new AppError('Failed to fetch budgets', 500)
    }
}

module.exports = getAllBudget
