//
//

const mongoose = require('mongoose')

// ✅ Correct order
require('./deposit')
require('./user')
require('./trx')
require('./actual')
require('./budget')
require('./project')

module.exports = {
    Deposit: mongoose.model('Deposit'),
    User: mongoose.model('User'),
    Trx: mongoose.model('Trx'),
    Actual: mongoose.model('Actual'),
    Budget: mongoose.model('Budget'),
    Project: mongoose.model('Project')
}
    
