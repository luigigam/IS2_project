require("dotenv").config()

const express = require("express")
const router = express.Router()
const User = require("../models/user")
const hashing = require("../middlewares/encrypt_pssw")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const Product = require("../models/product")
const authenticate = require("../middlewares/authenticateToken")

// Getting all
router.get("/", async (req, res) => {
	try {
		const users = await User.find()
		res.json(users)
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
})
// Getting one
router.get("/:id", getUser, (req, res) => {
	res.send(res.user)
})

router.get('/register', (req, res) => {
    res.render('register.ejs')
})
// Creating one
router.post("/register", async (req, res) => {
	const tmp = await User.findOne({ username: req.body.username })
	if (tmp == null) {
		const hashed = await hashing(req.body.password)
		const user = new User({
			username: req.body.username,
			password: hashed,
			email: req.body.email,
		})
		try {
			const newUser = await user.save()
			res.status(201).json(newUser)
		} catch (err) {
			res.status(400).json({ message: err.message })
		}
	} else {
		res.status(409).json("Username already in use")
	}
})
// Updating one
router.patch("/:id", getUser, async (req, res) => {
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
router.delete("/:id", getUser, async (req, res) => {
	try {
		await res.user.remove()
		res.json({ message: "Deleted User" })
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
})

let refreshTokens = []

// new access token
router.post("/token", (req, res) => {
	const refreshToken = req.body.token
	if (refreshToken == null) return res.sendStatus(401)
	if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
	jwt.verify(
		refreshToken,
		process.env.REFRESH_TOKEN_SECRET,
		async (err, user) => {
			if (err) return res.sendStatus(403)
			user = await User.findOne({ username: user.username })
			const accessToken = generateAccessToken(user.toJSON())
			res.json({ accessToken: accessToken })
		}
	)
})

// Logout
router.delete('/user/logout', (req, res) => {
	refreshTokens = refreshTokens.filter(token => token !== req.body.token)
	res.sendStatus(204)
})

// Login authentication
router.post("/login", async (req, res) => {
	const user = await User.findOne({ username: req.body.username })
	if (user == null) {
		return res.status(400).send("Cannot find user")
	}
	try {
		if (await bcrypt.compare(req.body.password, user.password)) {
			const accessToken = generateAccessToken(user.toJSON())
			const refreshToken = jwt.sign(
				user.toJSON(),
				process.env.REFRESH_TOKEN_SECRET
			)
			refreshTokens.push(refreshToken)
			res.json({ accessToken: accessToken, refreshToken: refreshToken })
		} else {
			res.send("Not Allowed")
		}
	} catch {
		res.status(500).send()
	}
})

// user's homepage
router.get("/home/all-products", authenticate, async (req, res) => {
	try {
		const products = await Product.find()
		res.json(products)
	} catch (err) {
		res.status(500).json({ message: err })
	}
})

function generateAccessToken(user) {
	return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '20s' })
}

async function getUser(req, res, next) {
	let user
	try {
		user = await User.findById(req.params.id)
		if (user == null) {
			return res.status(404).json({ message: "Cannot find user" })
		}
	} catch (err) {
		return res.status(500).json({ message: err.message })
	}

	res.user = user
	next()
}

module.exports = router
