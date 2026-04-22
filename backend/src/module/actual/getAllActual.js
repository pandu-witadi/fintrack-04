const { Actual } = require('../../model/index')
const AppError = require('../../util/appError')

const getAllActual = async (request, reply) => {
    try {
        const actuals = await Actual.find({})
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
            path: 'budget',
            select: '_id name amount'
        })
        .populate({
            path: 'trx',
            select: '_id name amount typ done project',
            populate: {
                path: 'project',
                select: '_id name'
            },
            options: {
                transform: (doc) => {
                    if (doc) {
                        doc._id = doc._id.toString()
                        if (doc.project) {
                            doc.projectId = doc.project._id.toString()
                            doc.projectName = doc.project.name
                            delete doc.project
                        }
                    }
                    return doc
                }
            }
        })
        .lean({ virtuals: true })

        actuals.forEach(actual => {
            actual._id = actual._id.toString()
        })

        // Sort by project.stDate ascending, then by type (income first, then expense)
        actuals.sort((a, b) => {
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
            pyd: actuals
        }
    } catch (error) {
        console.log(error)
        throw new AppError('Failed to fetch actuals', 500)
    }
}

module.exports = getAllActual
