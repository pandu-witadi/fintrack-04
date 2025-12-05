const { Project } = require('../../model/index')
const AppError = require('../../util/appError')

const getProjectById = async (request, reply) => {
    try {
        const project = await Project.findById(request.params.id)
            .populate({
                path: 'updatedBy',
                select: '_id name email'
            })
             .populate({
                path: 'lBudget',
                select: '_id name',
                options: {
                    transform: (doc) => {
                        if (doc) {
                            doc._id = doc._id.toString()
                        }
                        return doc
                    }
                }
            })
            .populate({
                path: 'lActual',
                select: '_id name',
                options: {
                    transform: (doc) => {
                        if (doc) {
                            doc._id = doc._id.toString()
                        }
                        return doc
                    }
                }
            })
            .populate({
                path: 'lTrx',
                select: '_id name',
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

        if (!project) {
            throw new AppError('Project not found', 404)
        }

        return {
            success: true,
            pyd: project
        }
    } catch (error) {
        if (error.kind === 'ObjectId') {
            throw new AppError('Invalid project ID', 400)
        }
        throw new AppError(error.message || 'Failed to fetch project', error.statusCode || 500)
    }
}

module.exports = getProjectById
