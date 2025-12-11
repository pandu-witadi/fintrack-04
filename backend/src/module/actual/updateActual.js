const { Actual } = require('../../model/index')
const AppError = require('../../util/appError')

const updateActual = async (request, reply) => {
    try {
        // Check if actual ID is provided
        const { id } = request.params
        if (!id) {
            throw new AppError('Please provide an actual ID', 400)
        }

        // Check if update data is provided
        const updateData = request.body
        if (!updateData) {
            throw new AppError('Please provide update data', 400)
        }

        const actual = await Actual.findById(id)
        if (!actual) {
            throw new AppError('Actual not found', 404)
        }

        // Handle null assignee - explicitly set to null if provided
        const dataToUpdate = { ...updateData, updatedBy: request.user._id }
        if (updateData.hasOwnProperty('assignee') && updateData.assignee === '') {
            dataToUpdate.assignee = null
        }

        // Update the actual with new data
        const updatedActual = await Actual.findByIdAndUpdate(
            id,
            dataToUpdate,
            { new: true, runValidators: true }
        )
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
                select: '_id name amount typ done project',
                populate: {
                    path: 'project',
                    select: '_id name'
                },
                options: {
                    transform: (doc) => {
                        if (doc) {
                            doc._id = doc._id.toString()
                            if (doc.project) {
                                doc.projectId = doc.project._id.toString()
                                doc.projectName = doc.project.name
                                delete doc.project
                            }
                        }
                        return doc
                    }
                }
            })
            .lean({ virtuals: true })

        updatedActual._id = updatedActual._id.toString()

        return {
            success: true,
            pyd: updatedActual
        }
    } catch (error) {
        if (error.kind === 'ObjectId') {
            throw new AppError('Invalid actual ID', 400)
        }
        if (error.name === 'ValidationError') {
            throw new AppError(error.message, 400)
        }
        console.log(error)
        throw new AppError(error.message || 'Failed to update actual', error.statusCode || 500)
    }
}

module.exports = updateActual
