const { Trx, Project, Actual } = require('../../model/index')
const AppError = require('../../util/appError')

const deleteTrx = async (request, reply) => {
    try {
        const { id } = request.params
        if (!id) {
            throw new AppError('Please provide transaction ID', 400)
        }

        const trx = await Trx.findById(id)
        if (!trx) {
            throw new AppError('Transaction not found', 404)
        }

        // Remove trx from project.lTrx array
        const project = await Project.findById(trx.project)
        if (project && project.lTrx) {
            project.lTrx = project.lTrx.filter(trxId => trxId.toString() !== id)
            await project.save()
        }

        // Update all actual.trx in lActual array
        const actuals = await Actual.find({ _id: { $in: trx.lActual } })
        for (const actual of actuals) {
            if (actual.trx && actual.trx.toString() === id) {
                actual.trx = null
                await actual.save()
            }
        }

        // Delete the trx
        await Trx.findByIdAndDelete(id)

        return {
            success: true,
            message: 'Transaction deleted successfully'
        }
    } catch (error) {
        if (error.kind === 'ObjectId') {
            throw new AppError('Invalid transaction ID', 400)
        }
        throw new AppError(error.message || 'Failed to delete transaction', error.statusCode || 500)
    }
}

module.exports = deleteTrx