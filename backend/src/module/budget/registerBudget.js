const { Project, Budget } = require('../../model/index')
const AppError = require('../../util/appError')

const registerBudget = async (request, reply) => {
    try {
        // check parameters and body
        const { name, projectId, amount, dateEx, ...otherKeys } = request.body

        if (!name || !projectId || amount === undefined || amount === null || !dateEx) {
            throw new AppError('Please provide name, project, amount, and dateEx', 400)
        }
        
        // check project exists
        const existingProject = await Project.findById(projectId)
        if (!existingProject) {
            throw new AppError('Project not found', 404)
        }

        const budget = await Budget.create({
            name: name,
            project: existingProject._id,
            amount: amount,
            dateEx: dateEx,
            updatedBy: request.user._id,
            ...otherKeys
        })

        // add budget to project.Lbudget
        if (existingProject.lBudget && existingProject.lBudget.length > 0) {
            existingProject.lBudget.push(budget._id.toString())
        } else {
            existingProject.lBudget = [budget._id.toString()]
        }
        await existingProject.save()

        return {
            success: true,
            pyd: budget
        }
    } catch (error) {
        if (error.kind === 'ObjectId') {
            throw new AppError('Invalid project ID', 400)
        }
        if (error.name === 'ValidationError') {
            throw new AppError(error.message, 400)
        }
        throw new AppError(error.message || 'Failed to register budget', error.statusCode || 500)
    }
}

module.exports = registerBudget
