// 
const AppError = require('../../util/appError')
const User = require('../../model/user')


const getMe = async (request, reply) => {
    const user = await User.findById(request.user.id)

    if (!user) {
        throw new AppError('User not found', 404)
    }

    // Ensure lastAccess is properly formatted
    const userObj = user.toObject()
    if (userObj.lastAccess) {
        userObj.lastAccess = userObj.lastAccess.toISOString()
    }

    reply.send({
        success: true,
        pyd: userObj
    })
}

module.exports = getMe