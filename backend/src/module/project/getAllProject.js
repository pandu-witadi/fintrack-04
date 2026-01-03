const { Project } = require('../../model/index')
const AppError = require('../../util/appError')

const getAllProject = async (request, reply) => {
    try {
        // Fetch all projects with populated references
        // Tags are included by default in the lean() response
        const projects = await Project.find({})
            .sort({ stDate: 1 })
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

        projects.forEach(project => {
            project._id = project._id.toString()
            // Tags are included in the response
        })

        return {
            success: true,
            pyd: projects
        }
    } catch (error) {
        console.log(error)
        throw new AppError('Failed to fetch projects', 500)
    }
}

module.exports = getAllProject
