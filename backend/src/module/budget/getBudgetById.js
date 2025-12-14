const { Budget } = require('../../model/index')
const AppError = require('../../util/appError')

const getBudgetById = async (request, reply) => {
    try {
        // check if budget Id is provided
        const { id } = request.params
        if (!id) {
            throw new AppError('Please provide a budget ID', 400)
        }

        const budget = await Budget.findById(id)
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
                select: '_id name amount typ done assignee',
                populate: {
                    path: 'assignee',
                    select: '_id name email'
                },
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

        if (!budget) {
            throw new AppError('Budget not found', 404)
        }

        budget._id = budget._id.toString()

        return {
            success: true,
            pyd: budget
        }
    } catch (error) {
        if (error.kind === 'ObjectId') {
            throw new AppError('Invalid budget ID', 400)
        }
        console.log(error)
        throw new AppError(error.message || 'Failed to fetch budget', error.statusCode || 500)
    }
}

module.exports = getBudgetById
