require('dotenv').config()

const express = require('express')
const router = express.Router()
const User = require('../models/user')
const hashing = require('../middlewares/encrypt_pssw')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// Getting all
router.get('/', async (req, res) => {
    try {
        const users = await User.find()
        res.json(users)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})
// Getting one
router.get('/:id', getUser, (req, res) => {
    res.send(res.user)
})
// Creating one
router.post('/', async (req, res) => {
    const hashed = await hashing(req.body.password);
    const user = new User({
        username: req.body.username,
        password: hashed,
        email: req.body.email
    })
    try {
        const newUser = await user.save()
        res.status(201).json(newUser)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})
// Updating one
router.patch('/:id', getUser, async (req, res) => {
    if (req.body.username != null) {
        res.user.username = req.body.username
    }
    if (req.body.password != null) {
        res.user.password = req.body.password
    }
    if (req.body.email != null) {
        res.user.email = req.body.email
    }
    try {
        const updatedUser = await res.user.save()
        res.json(updatedUser)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})
// Deleting one
router.delete('/:id', getUser, async (req, res) => {
    try {
        await res.user.remove()
        res.json({ message: 'Deleted User' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// Login authentication
router.post('/login', async (req, res) => {
    const user = await User.findOne({ username: req.body.username })
    if (user == null) {
        return res.status(400).send('Cannot find user')
    }
    try {
        if (await bcrypt.compare(req.body.password, user.password)) {
            const accessToken = jwt.sign(user.toJSON(), process.env.ACCESS_TOKEN_SECRET)
            res.json({ accessToken: accessToken })
            
        } else {
            res.send('Not Allowed')
        }
    } catch {
        res.status(500).send()
    }
})

async function getUser(req, res, next) {
    let user
    try {
        user = await User.findById(req.params.id)
        if (user == null) {
            return res.status(404).json({ message: 'Cannot find user' })
        }
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }

    res.user = user
    next()
}

module.exports = router