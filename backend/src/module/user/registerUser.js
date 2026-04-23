const { hashPassword } = require('../../util/crypt')
const AppError = require('../../util/appError')
const User = require('../../model/user')

const registerUser = async (request, reply) => {
    try {
        let { name, email, password, role, active, phone, note, bankInfo } = request.body
        
        // Check if user already exists
        const existingUser = await User.findOne({ email: email })
        if (existingUser) {
            throw new AppError('Email already in use', 400)
        }

        // Create new user with empty deposit array
        const user = await User.create({
            name: name,
            email: email,
            password: await hashPassword(password),
            role: role || 'user',
            active: active !== undefined ? active : true,
            phone: phone || '',
            note: note || '',
            bankInfo: bankInfo || {
                bankName: '',
                accNo: '',
                accName: ''
            },
            deposit: []
        })
        
        // Remove password from response
        user.password = undefined

        reply.send({
            success: true,
            pyd: user.toJSON()
        })
    } catch (error) {
        throw new AppError(error.message || 'Failed to register user', error.statusCode || 500)
    }
}

module.exports = registerUser
