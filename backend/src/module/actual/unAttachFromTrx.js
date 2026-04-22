const AppError = require('../../util/appError')
const { Actual, Trx } = require('../../model')

// Unattach an actual from a trx and update the trx's lActual array and amount
async function unAttachFromTrx(request, reply) {
    try {
        const { actualId, trxId } = request.body

        // Validate inputs
        if (!actualId || !trxId) {
            throw new AppError('actualId and trxId are required', 400)
        }

        // check trx
        const trx = await Trx.findById(trxId)
        if (!trx) {
            throw new AppError('Trx not found', 404)
        }

        // check actual
        const actual = await Actual.findById(actualId)
        if (!actual) {
            throw new AppError('Actual not found', 404)
        }

        // check if actual is attached to this trx
        // Note: we check toString() because trx might be an ObjectId or a populated object depending on context
        // But here we just read it from DB, so it should be an ObjectId
        if (!actual.trx || actual.trx.toString() !== trxId) {
            // If it's not attached to THIS trx, we might still want to proceed if trx.lActual contains it, 
            // but usually consistency is better.
            // Let's just make sure it's removed from trx.lActual regardless of actual.trx state to be safe, 
            // but usually they should match.
        }

        // Update actual: set trx to null
        actual.trx = null
        actual.updatedBy = request.user._id
        await actual.save()

        // Update trx: remove actualId from lActual
        trx.lActual = trx.lActual.filter(id => id.toString() !== actualId)

        // get all remaining actuals in trx.lActual to recalculate sum
        const allActualInTrx = await Actual.find({ _id: { $in: trx.lActual } })

        // update trx.amount with sum lActual.amount
        let sumAmount = 0
        for (let i = 0; i < allActualInTrx.length; i++) {
            sumAmount += allActualInTrx[i].amount
        }
        trx.amount = sumAmount
        await trx.save()

        return {
            success: true,
            pyd: allActualInTrx
        }
    } catch (error) {
        console.error('Error in unAttachFromTrx:', error)
        if (error instanceof AppError) {
            reply.status(error.statusCode).send({
                statusCode: error.statusCode,
                error: 'Error',
                message: error.message
            })
        } else {
            reply.status(500).send({
                statusCode: 500,
                error: 'Internal Server Error',
                message: 'An error occurred while unattaching actual from transaction'
            })
        }
    }
}

module.exports = unAttachFromTrx
