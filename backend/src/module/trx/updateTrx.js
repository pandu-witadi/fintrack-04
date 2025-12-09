const { Trx } = require('../../model/index')
const AppError = require('../../util/appError')

const updateTrx = async (request, reply) => {
    try {
        const { id } = request.params
        

        if (!id) {
            throw new AppError('Please provide transaction ID', 400)
        }

        // Remove fields that shouldn't be updated
        const updateData = request.body
        delete updateData.project
        delete updateData.updatedBy

        // Add updatedBy from authenticated user
        updateData.updatedBy = request.user._id
        
        if (updateData.assignee) {
            // Ensure assignee is an ObjectId
            updateData.assignee = new mongoose.Types.ObjectId(updateData.assignee)
        } else {
            delete updateData.assignee
        }

        const trx = await Trx.findByIdAndUpdate(
            id,
            { ...updateData, updatedBy: request.user._id },
            { new: true, runValidators: true }
        )
        if (!trx) {
            throw new AppError('Transaction not found', 404)
        }

        if (updateData.done) {
            // update all actual.done in lActual array to true
            await Actual.updateMany(
                { _id: { $in: trx.lActual } },
                { $set: { done: true } }
            )
        }   

        const populatedTrx = await Trx.findById(trx._id)
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
            path: 'lActual',
            select: '_id name typ amount done',
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

        return {
            success: true,
            pyd: populatedTrx
        }
    } catch (error) {
        if (error.kind === 'ObjectId') {
            throw new AppError('Invalid transaction ID', 400)
        }
        if (error.name === 'ValidationError') {
            throw new AppError(error.message, 400)
        }
        throw new AppError(error.message || 'Failed to update transaction', error.statusCode || 500)
    }
}

module.exports = updateTrx