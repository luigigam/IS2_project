const mongoose = require('mongoose')

const sellerSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    business_name: {
        type: String,
        required: true
    },
    adress: {
        type: String,
        required: true
    },
    phone_number: {
        type: Number,
        required: true
    }
})

module.exports = mongoose.model('Sellers', sellerSchema)