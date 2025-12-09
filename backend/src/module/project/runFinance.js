// 
const { Project, Budget, Actual } = require('../../model/index')
const AppError = require('../../util/appError')

const runFinance = async (request, reply) => {
    try {
        // check if project Id is provided
        const { id } = request.params
        if (!id) {
            throw new AppError('Please provide a project ID', 400)
        }

        const project = await Project.findById(request.params.id)
        if (!project) {
            throw new AppError('Project not found', 404)
        }
        project.info.income.budget = 0
        project.info.income.actual =  0
        project.info.expense.budget = 0
        project.info.expense.actual =  0
        project.info.profit.budget = 0
        project.info.profit.actual =  0
        
        let budget = null
        let actual = null
        for (let i = 0; i < project.lBudget.length; i++) {
            budget = await Budget.findById(project.lBudget[i].toString()).lean()
            if (budget) {
                if (budget && budget.active) {
                    if (budget.typ === 'income') {
                        project.info.income.budget += budget.amount
                    } else if (budget.typ === 'expense') {
                        project.info.expense.budget += budget.amount
                    } 
                }
                for (let j = 0; j < budget.lActual.length; j++) {
                    actual = await Actual.findById(budget.lActual[j].toString()).lean()
                    if (actual && actual.active) {       
                        if (actual.typ === 'income') {
                            project.info.income.actual += actual.amount 
                        } else if (actual.typ === 'expense') {
                            project.info.expense.actual += actual.amount
                        } 
                    }
                }
            }
        }
        project.info.profit.budget = project.info.income.budget - project.info.expense.budget
        project.info.profit.actual = project.info.income.actual - project.info.expense.actual    
    
        await project.save()
        return {
            success: true,
            pyd: project
        }
    } catch (error) {
        throw new AppError(error.message || 'Failed to calc finance', error.statusCode || 500)
    }
}

module.exports = runFinance
