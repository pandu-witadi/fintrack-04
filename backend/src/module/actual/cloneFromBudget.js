const { Actual, Budget, Project } = require('../../model/index')
const AppError = require('../../util/appError')

const cloneFromBudget = async (request, reply) => {
    try {
        // check parameters
        const { name, budgetId, amount, dateEx, ...otherKeys } = request.body
        if (!name || !budgetId || !amount || !dateEx) {
            throw new AppError('Please provide name, projectId, budgetId, amount, and dateEx', 400)
        }

        // check if budget exists
        let budget = await Budget.findById(budgetId)
        if (!budget) {
            throw new AppError('Budget not found', 404)
        }

        let project = await Project.findById(budget.project._id)
        
        const actual = await Actual.create({
            name: budget.name,
            budget: budgetId,
            project: budget.project._id.toString(),
            amount: budget.amount,
            dateEx: budget.dateEx,
            typ: budget.typ,
            updatedBy: request.user._id,
            ...otherKeys
        })

        // update budget.lActual, make sure no duplicate actual
        if (!budget.lActual.includes(actual._id)) {
            budget.lActual.push(actual._id)
            await budget.save()
        }

        // Update project.lActual, make sure no duplicate actual
        if (!project.lActual.includes(actual._id)) {
            project.lActual.push(actual._id)
            await project.save()
        }
        
        const populatedActual = await Actual.findById(actual._id)
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

        return {
            success: true,
            pyd: populatedActual
        }
    } catch (error) {
        if (error.kind === 'ObjectId') {
            throw new AppError('Invalid project ID', 400)
        }
        if (error.name === 'ValidationError') {
            throw new AppError(error.message, 400)
        }
        throw new AppError(error.message || 'Failed to register actual', error.statusCode || 500)
    }
}

module.exports = cloneFromBudget