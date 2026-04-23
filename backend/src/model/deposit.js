//
const mongoose = require('mongoose')

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

const depositSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Deposit must belong to a user'],
        unique: true,
    },
    total: {
        type: Number,
        default: 0
    },
    detail: [depositTrx]
}, {
    timestamps: true,
    collection: 'deposit'
})

// Ensure ObjectIds are serialized as strings when Mongoose converts to plain objects
depositSchema.set('toObject', {
    virtuals: true,
    transform: (doc, ret) => {
        if (ret._id) ret._id = ret._id.toString()
        if (ret.user) ret.user = ret.user.toString()
        return ret
    }
})

// Also set toJSON for direct JSON.stringify calls
depositSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        if (ret._id) ret._id = ret._id.toString()
        if (ret.user) ret.user = ret.user.toString()
        return ret
    }
})

// Check if model already exists to prevent OverwriteModelError
module.exports = mongoose.models.Deposit || mongoose.model('Deposit', depositSchema)
