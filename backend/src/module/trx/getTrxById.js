const { Trx } = require('../../model/index')
const AppError = require('../../util/appError')

const getTrxById = async (request, reply) => {
    try {
        const { id } = request.params
        
        if (!id) {
            throw new AppError('Please provide transaction ID', 400)
        }

        const trx = await Trx.findById(id)
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

        if (!trx) {
            throw new AppError('Transaction not found', 404)
        }

        trx._id = trx._id.toString()

        return {
            success: true,
            pyd: trx
        }
    } catch (error) {
        if (error.kind === 'ObjectId') {
            throw new AppError('Invalid transaction ID', 400)
        }
        throw new AppError(error.message || 'Failed to fetch transaction', error.statusCode || 500)
    }
}

module.exports = getTrxById