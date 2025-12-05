//
//
const mongoose = require('mongoose')

const { hashPassword } = require('../util/crypt')
const connectDB = require('./mongodb')
const User = require('../model/user')

require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

async function main() {
    
    try {
        const ADMIN_NAME = 'admin'
        const ADMIN_EMAIL = 'admin@mail.com'
        const ADMIN_PASSWORD = 'pegel1nux'
        const ADMIN_ROLE = 'admin'

    
        await connectDB(MONGODB_URI)

        const existing = await User.findOne({ email: ADMIN_EMAIL })
    
        if (existing) {
            // delete existing user
            await User.deleteOne({ email: ADMIN_EMAIL })
            console.log(`User with email ${ADMIN_EMAIL} deleted.`)
        }   

        const hashed = await hashPassword(ADMIN_PASSWORD)

        const doc = await User.create({
            name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            password: hashed,
            role: ADMIN_ROLE,
            active: true
        } )

        console.log(`User with email ${ADMIN_EMAIL} created.`)

        await mongoose.disconnect()
        process.exit(0)
    } catch (err) {
        console.error('Failed to seed user:', err)
        try { await mongoose.disconnect() } catch (_) {}
        process.exit(1)
    }
}

main()
