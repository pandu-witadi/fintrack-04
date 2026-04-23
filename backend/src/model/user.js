const mongoose = require('mongoose')

const { bankInfo } = require('./constant')

const depositTrx = {
    amount: { 
        type: Number, 
        trim: true,
        default: 0 
    },
    date: { 
        type: Date, 
        default: Date.now 
    },
    note: { 
        type: String, 
        trim: true,
        default: '' 
    },
}

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
        enum: ['guest', 'tax', 'vendor', 'user', 'finance', 'admin', 'other'],
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
    deposit: {
        type: [depositTrx],
        default: []
    }

}, {
    timestamps: true,
    collection: 'user'
})

// Virtual to calculate total deposit on the fly
userSchema.virtual('total').get(function () {
    return (this.deposit || []).reduce((sum, d) => sum + (d.amount || 0), 0)
})

userSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        if (ret._id) ret._id = ret._id.toString()
        if (ret.deposit && Array.isArray(ret.deposit)) {
            ret.deposit.forEach((d, i) => {
                if (d._id) ret.deposit[i]._id = d._id.toString()
            })
        }
        delete ret.__v
        return ret
    }
})

userSchema.set('toObject', {
    virtuals: true,
    transform: (doc, ret) => {
        if (ret._id) ret._id = ret._id.toString()
        if (ret.deposit && Array.isArray(ret.deposit)) {
            ret.deposit.forEach((d, i) => {
                if (d._id) ret.deposit[i]._id = d._id.toString()
            })
        }
        delete ret.__v
        return ret
    }
})

// Check if model already exists to prevent OverwriteModelError
module.exports = mongoose.models.User || mongoose.model('User', userSchema)