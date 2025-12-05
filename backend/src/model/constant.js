// 
const TYP = [
    'income',
    'expense'
]
const TYP_DEFAULT = 'expense'


const bankInfo = {
    bankName: { 
        type: String, 
        trim: true,
        default: '' 
    },
    accNo: { 
        type: String, 
        trim: true,
        default: '' 
    },
    accName: { 
        type: String, 
        trim: true,
        default: '' 
    },
}

module.exports = {
    TYP,
    TYP_DEFAULT,
    bankInfo
}
