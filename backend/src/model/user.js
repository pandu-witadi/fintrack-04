//
const mongoose = require('mongoose')

const { bankInfo } = require('./constant')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [
            /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
            'Please provide a valid email',
        ],
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [8, 'Password must be at least 8 characters long'],
        select: false,
    },
    role: {
        type: String,
        enum: ['guest', 'tax', 'vendor', 'user', 'finance', 'admin'],
        default: 'user',
    },
    active: {
        type: Boolean,
        default: true,
    },
    lastAccess: {
        type: Date,
        default: null
    },
    phone: {
        type: String,
        trim: true,
    },
    bankInfo: bankInfo,
    note: {
        type: String,
        trim: true,
    },

}, {
    timestamps: true,
    collection: 'user'
})

// Check if model already exists to prevent OverwriteModelError
module.exports = mongoose.models.User || mongoose.model('User', userSchema)