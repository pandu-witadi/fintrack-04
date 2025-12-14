const { Budget } = require('../../model/index')
const AppError = require('../../util/appError')

const getAllBudgetByProjectId = async (request, reply) => {
    try {
        // Check if project ID is provided
        const { projectId } = request.params
        if (!projectId) {
            throw new AppError('Project ID is required', 400)
        }

        const budgets = await Budget.find({ project: projectId })
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

        budgets.forEach(budget => {
            budget._id = budget._id.toString()
        })

        return {
            success: true,
            pyd: budgets
        }
    } catch (error) {
        console.log(error)
        throw new AppError('Failed to fetch budgets for project', 500)
    }
}

module.exports = getAllBudgetByProjectId
