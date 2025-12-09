const AppError = require('../../util/appError')
const { Actual, Trx } = require('../../model')


// Attach list of actual to a trx and update the trx's lActual array
async function attachToTrx(request, reply) {
    try {
        const { allActualId, trxId } = request.body

        // Validate that allActualId is provided and is non-empty array
        if (!allActualId || !Array.isArray(allActualId) || allActualId.length === 0) {
            throw new AppError('allActualId is required and must be a non-empty array', 400)
        }

        // check trx
        const trx = await Trx.findById(trxId)
        if (!trx) {
            throw new AppError('Trx not found', 404)
        }

        // check all actual is exist
        const actuals = await Actual.find({ _id: { $in: allActualId } })
        if (!actuals || actuals.length === 0) {
            throw new AppError('list actual are not found' , 404)
        } else {
            if (actuals.length !== allActualId.length) {
                throw new AppError('list actual are not complete' , 404)
            }    
        }

        // set all actual.trx to tr._id
        const actualUpdatePromises = actuals.map(actual => {
            actual.trx = trxId
            actual.updatedBy = request.user._id
            return actual.save()
        })
        await Promise.all(actualUpdatePromises)

        // add array of actual IDs to trx.lActual (not full documents)
        const actualIds = actuals.map(actual => actual._id)
        actualIds.forEach(actualId => {
            if (!trx.lActual.includes(actualId)) {
                trx.lActual.push(actualId)
            }
        })

        // get all actual in trx.lActual
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
        console.error('Error in attachToTrx:', error)
        reply.status(500).send({
            statusCode: 500,
            error: 'Internal Server Error',
            message: 'An error occurred while attaching actual to transaction'
        })
    }
}

module.exports = attachToTrx