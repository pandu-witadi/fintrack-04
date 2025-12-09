const { Budget, Project, Ac } = require('../../model/index')
const AppError = require('../../util/appError')


const deleteBudget = async (request, reply) => {
    try {
        // check if budget Id is provided
        const { id } = request.params
        if (!id) {
            throw new AppError('budget Id is required', 400)
        }
        
        // check if budget exists
        const budget = await Budget.findById(id)
        if (!budget) {
            throw new AppError('Budget not found', 404)
        }

        // check if budget has linked Actual entries
        const hasLActual = Array.isArray(budget.lActual) && budget.lActual.length > 0
        if (hasLActual) {
            throw new AppError('Cannot delete budget: remove all linked Actual entries first', 400)
        }

        // update project lBudget
        let project = await Project.findById(budget.project.toString())
        if (!project) {
            throw new AppError('Project not found', 404)
        }

        // remove budgetId from project lBudget
        project.lBudget = project.lBudget.filter(budgetId => budgetId.toString() !== id)
        await project.save()

        await Budget.findByIdAndDelete(id)

        return {
            success: true,
            message: 'Budget deleted successfully'
        }
    } catch (error) {
        if (error.kind === 'ObjectId') {
            throw new AppError('Invalid budget ID', 400)
        }
        console.log(error)
        throw new AppError(error.message || 'Failed to delete budget', error.statusCode || 500)
    }
}

module.exports = deleteBudget
