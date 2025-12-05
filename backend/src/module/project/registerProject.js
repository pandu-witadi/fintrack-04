const { Project } = require('../../model/index')
const AppError = require('../../util/appError')


const registerProject = async (request, reply) => {
    try {
        const { code, name, updatedBy, ...otherKeys } = request.body

        const existingProject = await Project.findOne({ code: code })
        if (existingProject) {
            throw new AppError('Project already in use', 400)
        }

        const project = await Project.create({
            code: code,
            name: name,
            updatedBy: request.user._id,
            ...otherKeys
        })

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
