const AppError = require('../../util/appError')
const User = require('../../model/user')


const getAllUser = async (request, reply) => {
    try {
        const users = await User.find({})
            .select('-password -__v')
            .sort({ createdAt: -1 })

        return {
            success: true,
            pyd: users
        }
    } catch (error) {
        throw new AppError('Failed to fetch users', 500)
    }
}

module.exports = getAllUser
