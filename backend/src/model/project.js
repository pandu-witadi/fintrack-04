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

const client = {
    company: {
        type: String,
        trim: true,
        maxlength: [50, 'Company name cannot be more than 50 characters'],
    },
    sub: {
        type: String,
        trim: true,
        maxlength: [50, 'sub company name cannot be more than 50 characters'],
    },
    contact: String,
    phone: String,
    email: String,
    address: {
        type: String,
        trim: true,
        maxlength: [100, 'Address cannot be more than 100 characters'],
    }
}


const projectSchema = new mongoose.Schema({
    code: {
        type: String,
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
    // year: {
    //     type: Number,
    //     default: new Date().getFullYear(),
    // },
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
    client: client,
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
