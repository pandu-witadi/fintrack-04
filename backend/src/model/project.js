//
//
const mongoose = require('mongoose')

const info = {
    income: { 
        budget: { type: Number, default: 0 }, 
        actual: { type: Number, default: 0 } 
    },
    expense: { 
        budget: { type: Number, default: 0 }, 
        actual: { type: Number, default: 0 } 
    },
    profit: { 
        budget: { type: Number, default: 0 }, 
        actual: { type: Number, default: 0 } 
    },
    note: { type: String, trim: true }  
}

const projectSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Please provide a code'],
        trim: true,
        maxlength: [50, 'Code cannot be more than 50 characters'],
    },
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
    done: {
        type: Boolean,
        default: false,
    },
    typ: {
        type: String,
        enum: ['project', 'routine', 'other'],
        default: 'project',
    },
    year: {
        type: Number,
        default: new Date().getFullYear(),
    },
    stDate: {
        type: Date,
        default: new Date(),
    },
    enDate: {
        type: Date,
        default: new Date(),
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    lBudget: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Budget'
    }],
    lActual: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Actual'
    }],
    lTrx: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trx'
    }],
    info: info,
}, {
    strict: false,
    strictPopulate: false,
    timestamps: true,
    collection: 'project',
})


// Enable virtuals in JSON responses
projectSchema.set('toJSON', { virtuals: true });
projectSchema.set('toObject', { virtuals: true });

// Check if model already exists to prevent OverwriteModelError
module.exports = mongoose.models.Project || mongoose.model('Project', projectSchema)
