const { Project } = require('../../model/index')
const AppError = require('../../util/appError')

const updateProject = async (request, reply) => {
    try {
        let updateData = { ...request.body }
        updateData.updatedBy = request.user._id

        // Handle optional client field - only include if it has meaningful data
        if (updateData.client) {
            const hasClientData = Object.values(updateData.client).some(
                value => value && String(value).trim() !== ''
            )
            if (!hasClientData) {
                // If client object exists but is empty, unset it
                updateData.client = undefined
            }
        }

        const project = await Project.findByIdAndUpdate(
            request.params.id,
            updateData,
            { new: true, runValidators: true }
        )
        .populate({
            path: 'updatedBy',
            select: '-_id name email'
        })
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
        if (error.name === 'ValidationError') {
            throw new AppError(error.message, 400)
        }
        if (error.code === 11000) {
            throw new AppError('Email already in use', 400)
        }
        throw new AppError(error.message || 'Failed to update project', error.statusCode || 500)
    }
}

module.exports = updateProject
