//
const jwt = require('jsonwebtoken')


const signToken = (id) => {
    return jwt.sign(
        { id }, 
        process.env.JWT_SECRET, 
        {
            expiresIn: process.env.JWT_EXPIRES_IN,
        }
    )
}

const createSendToken = (user, request) => {
    const token = signToken(user._id)
    
    // Remove password from output
    user.password = undefined

    // Return both the token and cookie options
    return {
        token,
        data: {
            user,
        },
    }
};

module.exports = {
    signToken,
    createSendToken,
}