const AppError = require('../../util/appError')
const User = require('../../model/user')

const deleteUser = async (request, reply) => {
    try {
        const user = await User.findByIdAndDelete(request.params.id)

        if (!user) {
            throw new AppError('User not found', 404)
        }

        return {
            success: true,
            pyd: user,
            message: 'User deleted successfully'
        }
    } catch (error) {
        if (error.kind === 'ObjectId') {
            throw new AppError('Invalid user ID', 400)
        }
        throw new AppError(error.message || 'Failed to delete user', error.statusCode || 500)
    }
}

module.exports = deleteUser
