//
//
const mongoose = require('mongoose')

const { TYP, TYP_DEFAULT, bankInfo, } = require('./constant')


const trxSchema = new mongoose.Schema({
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
        default: TYP_DEFAULT,
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
    lActual: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Actual'
    }],
    dateEx: {
        type: Date,
        required: [true, 'Please provide date of execution'],
    },
    sndr: bankInfo,
    recv: bankInfo,
    img: {
        type: String,
        default: '',
        trim: true      
    }
}, {
    strict: false,
    strictPopulate: false,
    timestamps: true,
    collection: 'trx',
})

// Add virtual for dynamic transaction lookup
trxSchema.virtual('evn', {
    ref: 'Evn',
    localField: '_id',
    foreignField: 'trx'
});

// Enable virtuals in JSON responses
trxSchema.set('toJSON', { virtuals: true })
trxSchema.set('toObject', { virtuals: true })

// Check if model already exists to prevent OverwriteModelError
module.exports = mongoose.models.Trx || mongoose.model('Trx', trxSchema)
