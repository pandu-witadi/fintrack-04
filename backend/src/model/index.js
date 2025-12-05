//
//

const mongoose = require('mongoose')

// ✅ Correct order
require('./user')
require('./trx')
require('./actual')
require('./budget')
require('./project')

module.exports = {
    User: mongoose.model('User'),
    Trx: mongoose.model('Trx'),
    Actual: mongoose.model('Actual'),
    Budget: mongoose.model('Budget'),
    Project: mongoose.model('Project')
}
    
