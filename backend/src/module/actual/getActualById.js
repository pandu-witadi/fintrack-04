const { Actual } = require('../../model/index')
const AppError = require('../../util/appError')

const getActualById = async (request, reply) => {
    try {
        // Check if actual ID is provided
        const { id } = request.params
        if (!id) {
            throw new AppError('Please provide actual ID', 400)
        }
        
        const actual = await Actual.findById(id)
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
        .lean({ virtuals: true })

        if (!actual) {
            throw new AppError('Actual not found', 404)
        }

        actual._id = actual._id.toString()

        return {
            success: true,
            pyd: actual
        }
    } catch (error) {
        if (error.kind === 'ObjectId') {
            throw new AppError('Invalid actual ID', 400)
        }
        console.log(error)
        throw new AppError(error.message || 'Failed to fetch actual', error.statusCode || 500)
    }
}

module.exports = getActualById
