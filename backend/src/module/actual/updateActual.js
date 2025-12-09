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

        // Update the actual with new data
        const updatedActual = await Actual.findByIdAndUpdate(
            id,
            { ...updateData, updatedBy: request.user._id },
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
                select: '_id name amount'
            })

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
