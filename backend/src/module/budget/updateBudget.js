const { Budget } = require('../../model/index')
const AppError = require('../../util/appError')

const updateBudget = async (request, reply) => {
    try {
        const { id } = request.params
        const budget = await Budget.findById(id)
        if (!budget) {
            throw new AppError('Budget not found', 404)
        }

        // Check if update data is provided
        const updateData = request.body
        if (!updateData) {
            throw new AppError('Please provide update data', 400)
        }   

        // Remove fields that shouldn't be updated directly
        delete updateData._id
        delete updateData.createdAt
        delete updateData.updatedAt
        delete updateData.project
        delete updateData.updatedBy

        // Handle assignee: convert empty string or null to null
        if (updateData.assignee === '' || updateData.assignee === null) {
            updateData.assignee = null
        }

        // Handle dateEx fields
        if (updateData.dateEx) {
            // Convert string to Date object if needed
            if (typeof updateData.dateEx === 'string') {
                updateData.dateEx = new Date(updateData.dateEx)
            }
        }

        // Add updatedBy from authenticated user
        updateData.updatedBy = request.user._id

        // Update the budget with new data
        const updatedBudget = await Budget.findByIdAndUpdate(
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
            path: 'lActual',
            select: '_id name amount typ done',
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
        
        updatedBudget._id = updatedBudget._id.toString()
        
        return {
            success: true,
            pyd: updatedBudget
        }
    } catch (error) {
        if (error.kind === 'ObjectId') {
            throw new AppError('Invalid budget ID', 400)
        }
        if (error.name === 'ValidationError') {
            throw new AppError(error.message, 400)
        }
        console.log(error)
        throw new AppError(error.message || 'Failed to update budget', error.statusCode || 500)
    }
}

module.exports = updateBudget
