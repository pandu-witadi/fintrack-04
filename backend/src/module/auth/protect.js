const jwt = require('jsonwebtoken')
const AppError = require('../../util/appError')
const User = require('../../model/user')


const protect = async (request, reply) => {
    console.log('...request headers authorization ...', request.headers.authorization)
    try {
        let token
        if (request.headers.authorization && request.headers.authorization.startsWith('Bearer')) {
            token = request.headers.authorization.split(' ')[1]
        } else if (request.cookies.jwt) {
            token = request.cookies.jwt
        }

        if (!token) {
            throw new AppError('You are not logged in! Please log in to get access.', 401)
        }

        const decoded = await new Promise((resolve, reject) => {
            jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                if (err) return reject(new AppError('Invalid token. Please log in again!', 401))
                resolve(decoded)
            })
        })

        const currentUser = await User.findById(decoded.id)
        if (!currentUser) {
            throw new AppError('The user belonging to this token no longer exists.', 401)
        }

        // Update last access time
        currentUser.lastAccess = new Date()
        await currentUser.save()

        request.user = currentUser
        return currentUser
    } catch (err) {
        throw new AppError('You are not authorized to access this route', 401)
    }
}

module.exports = protect