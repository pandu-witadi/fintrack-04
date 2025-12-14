const { Project } = require('../../model/index')
const AppError = require('../../util/appError')


const registerProject = async (request, reply) => {
    try {
        const { code, name, updatedBy, client, ...otherKeys } = request.body

        const existingProject = await Project.findOne({ code: code })
        if (existingProject) {
            throw new AppError('Project already in use', 400)
        }

        // Only include client if it has at least one non-empty value
        const projectData = {
            code: code,
            name: name,
            updatedBy: request.user._id,
            ...otherKeys
        }
        
        // Add client only if it has meaningful data
        if (client && Object.values(client).some(value => value && String(value).trim() !== '')) {
            projectData.client = client
        }

        const project = await Project.create(projectData)

        reply.send({
            success: true,
            pyd: project
        })
    } catch (error) {
        if (error.kind === 'ObjectId') {
            throw new AppError('Invalid project ID', 400)
        }
        if (error.name === 'ValidationError') {
            throw new AppError(error.message, 400)
        }
        throw new AppError(error.message || 'Failed to register project', error.statusCode || 500)
    }
}

module.exports = registerProject
