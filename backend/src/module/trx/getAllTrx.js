const { Trx } = require('../../model/index')
const AppError = require('../../util/appError')

const getAllTrx = async (request, reply) => {
    try {
        const trxs = await Trx.find({})
        .populate({
            path: 'project',
            select: '_id name code stDate'
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

        trxs.forEach(trx => {
            trx._id = trx._id.toString()
        })

        // Sort by project.stDate ascending, then by type (income first, then expense)
        trxs.sort((a, b) => {
            // First, sort by project.stDate ascending
            if (a.project && b.project) {
                const dateA = new Date(a.project.stDate).getTime()
                const dateB = new Date(b.project.stDate).getTime()
                if (dateA !== dateB) {
                    return dateA - dateB
                }
            }
            
            // If same project, sort by type: income first, then expense
            const typeOrder = { 'income': 0, 'expense': 1 }
            const typeA = typeOrder[a.typ] ?? 2
            const typeB = typeOrder[b.typ] ?? 2
            return typeA - typeB
        })

        return {
            success: true,
            pyd: trxs
        }
    } catch (error) {
        console.log(error)
        throw new AppError('Failed to fetch transactions', 500)
    }
}

module.exports = getAllTrx