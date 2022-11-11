const express = require('express')
const router = express.Router()
const Product = require('../models/product')
const Seller = require('../models/seller')

// Getting all
router.get('/', async (req, res) => {
    try {
        const products = await Product.find()
        res.json(products)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})
// Getting one
router.get('/:id', getProduct, (req, res) => {
    res.send(res.product)
})
// Creating one
router.post('/', async (req, res) => {
    const seller = await Seller.findOne({ business_name: req.body.seller })
    const product = new Product({
        name: req.body.name,
        place_of_production: req.body.place_of_production,
        availability: true
        })
    try {
        const newProduct = await product.save()
        res.status(201).json(newProduct)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})
// Updating one
router.patch('/:id', getProduct, async (req, res) => {
    if (req.body.name != null) {
        res.product.name = req.body.name
    }
    if (req.body.place_of_production != null) {
        res.product.place_of_production = req.body.place_of_production
    }
    if (req.body.availability != null) {
        res.product.availability = req.body.availability
    }
    try {
        const updatedProduct = await res.product.save()
        res.json(updatedProduct)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

// Deleting one
router.delete('/:id', getProduct, async (req, res) => {
    try {
        await res.product.remove()
        res.json({ message: 'Deleted Product' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

async function getProduct(req, res, next) {
    let product
    try {
        product = await Product.findById(req.params.id)
        if (product == null) {
            return res.status(404).json({ message: 'Cannot find product' })
        }
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }

    res.product = product
    next()
}

module.exports = router