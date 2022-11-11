const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    place_of_production: {
        type: String,
        required: true
    },
    availability: {
        type: Boolean,
        default: false
    },
    seller: {
        type: String
    }
})

module.exports = mongoose.model('Products', productSchema)