const { Trx, Actual } = require('../../model/index')
const AppError = require('../../util/appError')

const getTrxByActualId = async (request, reply) => {
    try {
        const { actualId } = request.params
        
        if (!actualId) {
            throw new AppError('Please provide actual ID', 400)
        }

        // First, find the actual to verify it exists and get the trx reference
        const actual = await Actual.findById(actualId)
        if (!actual) {
            throw new AppError('Actual not found', 404)
        }

        // If no trx is linked to this actual, return null
        if (!actual.trx) {
            return {
                success: true,
                pyd: null
            }
        }

        // Find the trx document
        const trx = await Trx.findById(actual.trx._id.toString())
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
            select: '_id active name typ amount done dateEx',
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

        if (trx) {
            trx._id = trx._id.toString()
        }

        return {
            success: true,
            pyd: trx
        }
    } catch (error) {
        if (error.kind === 'ObjectId') {
            throw new AppError('Invalid actual ID', 400)
        }
        throw new AppError(error.message || 'Failed to fetch transaction', error.statusCode || 500)
    }
}

module.exports = getTrxByActualId