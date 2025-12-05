const { Project, Budget, Actual, Trx } = require('../../model/index')
const AppError = require('../../util/appError')

const deleteProject = async (request, reply) => {
    try {
        const project = await Project.findById(request.params.id)

        if (!project) {
            throw new AppError('Project not found', 404)
        }

        const hasLBudget = Array.isArray(project.lBudget) && project.lBudget.length > 0
        const hasLActual = Array.isArray(project.lActual) && project.lActual.length > 0
        const hasLTrx = Array.isArray(project.lTrx) && project.lTrx.length > 0

        if (hasLBudget || hasLActual || hasLTrx) {
            throw new AppError('Cannot delete project: remove all linked budget/actual/ltrx entries first', 400)
        }

        await Project.findByIdAndDelete(request.params.id)

        return {
            success: true,
            message: 'Project deleted successfully'
        }
    } catch (error) {
        if (error.kind === 'ObjectId') {
            throw new AppError('Invalid project ID', 400)
        }
        throw new AppError(error.message || 'Failed to delete project', error.statusCode || 500)
    }
}

module.exports = deleteProject
