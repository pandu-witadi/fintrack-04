const { comparePassword } = require('../../util/crypt')
const { signToken } = require('../../util/auth')
const AppError = require('../../util/appError')
const User = require('../../model/user')

const login = async (request, reply) => {
    let { email, password } = request.body

    if (!email || !password) {
        throw new AppError('Please provide email and password!', 400)
    }

    const user = await User.findOne({ email }).select('+password')

    if (!user || !(await comparePassword(password, user.password))) {
        throw new AppError('Incorrect email or password', 401)
    }
    
    // Update last access time
    user.lastAccess = new Date()
    await user.save()
    
    user.password = undefined
    const token = signToken(user._id)

    // Ensure lastAccess is properly formatted
    const userObj = user.toObject()
    if (userObj.lastAccess) {
        userObj.lastAccess = userObj.lastAccess.toISOString()
    }

    reply.send({
        success: true,
        pyd: userObj,
        token
    })
}

module.exports = login