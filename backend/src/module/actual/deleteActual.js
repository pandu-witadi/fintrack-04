const { Actual, Project, Budget } = require('../../model/index')
const AppError = require('../../util/appError')

const deleteActual = async (request, reply) => {
    try {
        // check if budget Id is provided
        const { id } = request.params
        if (!id) {
            throw new AppError('Please provide an actual Id', 400)
        }

        // check if actual exists
        const actual = await Actual.findById(id)
        if (!actual) {
            throw new AppError('Actual not found', 404)
        }

        let project = await Project.findById(actual.project._id.toString())
        if (!project) {
            throw new AppError('Project not found', 404)
        }
        // remove actual from project.lActual
        project.lActual = project.lActual.filter((a) => a.toString() !== id)
        await project.save()

        let budget = await Budget.findById(actual.budget._id.toString())
        if (!budget) {
            throw new AppError('Budget not found', 404)
        }
        // remove actual from budget.lActual
        budget.lActual = budget.lActual.filter((a) => a.toString() !== id)
        await budget.save()

        // remove actual from trx
        // not yet implemented

        await Actual.findByIdAndDelete(id)

        return {
            success: true,
            message: 'Actual deleted successfully'
        }
    } catch (error) {
        if (error.kind === 'ObjectId') {
            throw new AppError('Invalid actual ID', 400)
        }
        console.log(error)
        throw new AppError(error.message || 'Failed to delete actual', error.statusCode || 500)
    }
}

module.exports = deleteActual
