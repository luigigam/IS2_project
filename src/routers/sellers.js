const express = require('express')
const router = express.Router()
const Seller = require('../models/seller')
const hashing = require('../middlewares/encrypt_pssw')
const bcrypt = require('bcrypt')

// Getting all
router.get('/', async (req, res) => {
    try {
        const sellers = await Seller.find()
        res.json(sellers)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})
// Getting one
router.get('/:id', getSeller, (req, res) => {
    res.send(res.seller)
})
// Creating one
router.post('/', async (req, res) => {
    const hashed = await hashing(req.body.password);
    const seller = new Seller({
        username: req.body.username,
        password: hashed,
        email: req.body.email,
        business_name: req.body.business_name,
        adress: req.body.adress,
        phone_number: req.body.phone_number
    })
    try {
        const newSeller = await seller.save()
        res.status(201).json(newSeller)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})
// Updating one
router.patch('/:id', getSeller, async (req, res) => {
    if (req.body.username != null) {
        res.seller.username = req.body.username
    }
    if (req.body.password != null) {
        res.seller.password = req.body.password
    }
    if (req.body.email != null) {
        res.seller.email = req.body.email
    }
    if (req.body.business_name != null) {
        res.seller.business_name = req.body.business_name
    }
    if (req.body.address != null) {
        res.seller.address = req.body.address
    }
    if (req.body.phone_number != null) {
        res.seller.phone_number = req.body.phone_number
    }
    try {
        const updatedSeller = await res.seller.save()
        res.json(updatedSeller)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

// Deleting one
router.delete('/:id', getSeller, async (req, res) => {
    try {
        await res.seller.remove()
        res.json({ message: 'Deleted Seller' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// Login authentication
router.post('/login', async (req, res) => {
    const seller = await Seller.findOne({ username: req.body.username })
    if (seller == null) {
        return res.status(400).send('Cannot find seller')
    }
    try {
        if (await bcrypt.compare(req.body.password, seller.password)) {
            res.send('Success')
        } else {
            res.send('Not Allowed')
        }
    } catch {
        res.status(500).send()
    }
})

async function getSeller(req, res, next) {
    let seller
    try {
        seller = await Seller.findById(req.params.id)
        if (seller == null) {
            return res.status(404).json({ message: 'Cannot find seller' })
        }
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }

    res.seller = seller
    next()
}

module.exports = router