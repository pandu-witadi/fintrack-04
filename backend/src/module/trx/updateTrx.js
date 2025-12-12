const { Trx, Actual } = require('../../model/index')
const AppError = require('../../util/appError')
const mongoose = require('mongoose')

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

        // update all actual.done in lActual array to true
        if (updateData.done) {
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
            select: '_id active name typ amount done dateEx project assignee',
            populate: [
                {
                    path: 'project',
                    select: '_id name'
                },
                {
                    path: 'assignee',
                    select: '_id name'
                }
            ],
            options: {
                transform: (doc) => {
                    if (doc) {
                        doc._id = doc._id.toString()
                        if (doc.project) {
                            doc.projectId = doc.project._id.toString()
                            doc.projectName = doc.project.name
                            delete doc.project
                        }
                        if (doc.assignee) {
                            doc.assigneeId = doc.assignee._id.toString()
                            doc.assigneeName = doc.assignee.name
                            delete doc.assignee
                        }
                    }
                    return doc
                }
            }
        })
        .lean({ virtuals: true })

        populatedTrx._id = populatedTrx._id.toString()

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