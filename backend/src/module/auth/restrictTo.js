// 
const AppError = require('../../util/appError')


const restrictTo = (roles) => {
    return (request, reply, done) => {
        if (!request.user.active) {
            return done(new AppError('Your status inactive', 403))
        }
        if (!roles.includes(request.user.role)) {
            return done(new AppError('You do not have permission to perform this action', 403))
        }
        done()
    }
}

module.exports = restrictTo
