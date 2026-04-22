const AppError = require('../../util/appError')
const { hashPassword } = require('../../util/crypt')
const User = require('../../model/user')

const updateUser = async (request, reply) => {
    try {
        let user = await User.findById(request.params.id)
        if (!user) {
            throw new AppError('User not found', 404)
        }

        const isAdmin = request.user.role === 'admin';
        const isSelf = request.user._id.toString() === user._id.toString();

        if (isAdmin || isSelf) {
            let updateData = { ...request.body }

            // if update password, hash the password
            const { password } = request.body
            if (password) {
                let newPassword = await hashPassword(password)
                updateData.password = newPassword
            }

            // if not admin, cannot change role or active status
            if (!isAdmin) {
                delete updateData.role;
                delete updateData.active;
            }

            const updatedUser = await User.findByIdAndUpdate(
                user._id,
                updateData,
                { new: true, runValidators: true }
            ).select('-password -__v')

            return {
                success: true,
                pyd: updatedUser,
                message: 'User updated successfully'
            }
        } else {
            throw new AppError('You do not have permission to update this user', 403)
        }
    } catch (error) {
        if (error.kind === 'ObjectId') {
            throw new AppError('Invalid user ID', 400)
        }
        if (error.name === 'ValidationError') {
            throw new AppError(error.message, 400)
        }
        if (error.code === 11000) {
            throw new AppError('Email already in use', 400)
        }
        throw new AppError(error.message || 'Failed to update user', error.statusCode || 500)
    }
}

module.exports = updateUser
