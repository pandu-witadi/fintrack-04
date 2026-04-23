const AppError = require('../../util/appError')
const User = require('../../model/user')

const getUserById = async (request, reply) => {
    try {
        const user = await User.findById(request.params.id)
            .select('-password -__v')

        if (!user) {
            throw new AppError('User not found', 404)
        }

        return {
            success: true,
            pyd: user.toJSON()
        }
    } catch (error) {
        if (error.kind === 'ObjectId') {
            throw new AppError('Invalid user ID', 400)
        }
        throw new AppError(error.message || 'Failed to fetch user', error.statusCode || 500)
    }
}

module.exports = getUserById
