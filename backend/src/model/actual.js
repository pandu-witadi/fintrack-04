//
//
const mongoose = require('mongoose')

const { TYP, TYP_DEFAULT } = require('./constant')

const actualSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    note: {
        type: String,
        trim: true
    },
    active: {
        type: Boolean,
        default: true,
    },
    typ: {
        type: String,
        enum: TYP,
        default: TYP_DEFAULT
    },
    done: {
        type: Boolean,
        default: false,
    },
    amount: {
        type: Number,
        required: [true, 'Please provide an amount'],
    },
    detailedAmount: {
        currency: {
            type: String,
            default: 'IDR'
        },
        value: {
            type: Number,
            default: 0
        },
        exRate: {
            type: Number,
            default: 1
        }
    },
    project: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Project',
         required: true,
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    assignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    budget: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Budget'
    },
    trx: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trx'
    },
    dateEx: {
        type: Date,
        required: [true, 'Please provide date of execution'],
    },
}, {
    strict: false,
    strictPopulate: false,
    timestamps: true,
    collection: 'actual',
})

// Enable virtuals in JSON responses
actualSchema.set('toJSON', { virtuals: true });
actualSchema.set('toObject', { virtuals: true });

// Check if model already exists to prevent OverwriteModelError
module.exports = mongoose.models.Actual || mongoose.model('Actual', actualSchema)
