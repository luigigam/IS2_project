require("dotenv").config()

const express = require("express")
const router = express.Router()
const Seller = require("../models/seller")
const hashing = require("../middlewares/encrypt_pssw")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const Product = require("../models/product")
const authenticate = require("../middlewares/authenticateToken")

router.use(express.urlencoded({ extended: false }))

router.get("/login", (req, res) => {
	res.render("seller_login.ejs")
})

router.get("/register", (req, res) => {
	res.render("seller_register.ejs")
})

/*router.get('/home/my-products', (req, res) => {
    res.render('homepage.ejs')
})
*/

// Getting all
router.get("/", async (req, res) => {
	try {
		const sellers = await Seller.find()
		res.json(sellers)
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
})
// Getting one
router.get("/:id", getSeller, (req, res) => {
	res.send(res.seller)
})
// Creating one
router.post("/register", async (req, res) => {
	const tmp = await Seller.findOne({ username: req.body.username })
	if (tmp == null) {
		const hashed = await hashing(req.body.password)
		const seller = new Seller({
			username: req.body.username,
			password: hashed,
			email: req.body.email,
			business_name: req.body.business_name,
			adress: req.body.adress,
		})
		try {
			const newSeller = await seller.save()
			//res.status(201).json(newSeller)
			res.redirect("/api/sellers/login")
		} catch (err) {
			res.status(400).json({ message: err.message })
			res.redirect("/api/sellers/register")
		}
	} else {
		res.status(409).json("Username already in use")
		res.redirect("/api/sellers/register")
	}
})
// Updating one
router.patch("/:id", getSeller, async (req, res) => {
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
	if (req.body.adress != null) {
		res.seller.adress = req.body.adress
	}
	try {
		const updatedSeller = await res.seller.save()
		res.json(updatedSeller)
	} catch (err) {
		res.status(400).json({ message: err.message })
	}
})

// Deleting one
router.delete("/:id", getSeller, async (req, res) => {
	try {
		await res.seller.remove()
		res.json({ message: "Deleted Seller" })
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
		async (err, seller) => {
			if (err) return res.sendStatus(403)
			seller = await Seller.findOne({ username: seller.username })
			const accessToken = generateAccessToken(seller.toJSON())
			res.json({ accessToken: accessToken })
		}
	)
})

// Logout
router.delete("/seller/logout", (req, res) => {
	refreshTokens = refreshTokens.filter((token) => token !== req.body.token)
	res.sendStatus(204)
})

// Login authentication
router.post("/login", async (req, res) => {
	const seller = await Seller.findOne({ username: req.body.username })
	if (seller == null) {
		//res.redirect('/api/sellers/login')
		return res.status(400).send("Cannot find seller")
	}
	try {
		if (await bcrypt.compare(req.body.password, seller.password)) {
			const accessToken = generateAccessToken(seller.toJSON())
			const refreshToken = jwt.sign(
				seller.toJSON(),
				process.env.REFRESH_TOKEN_SECRET
			)
			refreshTokens.push(refreshToken)
			res.json({ accessToken: accessToken, refreshToken: refreshToken })
			sessionStorage.setItem("accessToken", accessToken)
			//res.redirect("/api/sellers/home/my-products")
		} else {
			res.send("Not Allowed")
			res.redirect('/api/sellers/login')
		}
	} catch {
		res.status(500).send()
		res.redirect('/api/sellers/login')
	}
})

// seller's homepage
router.get("/home/my-products", authenticate, async (req, res) => {
	try {
		/*var bearer_token = sessionStorage.getItem("token")
		var bearer = "Bearer " + bearer_token
		fetch("../api/sellers/home/my-products", {
			method: "GET",
			withCredentials: true,
			credentials: "include",
			headers: {
				Authorization: bearer,
				"Content-Type": "application/json",
			},
		})
			.then((resp) => resp.json())
			.catch((error) =>
				this.setState({
					isLoading: false,
					message: "Something bad happened " + error,
				})
			)*/
		const products = await Product.find()
		res.json(
			products.filter(
				(product) => product.seller === req.any_user.business_name
			)
		)
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
})

function generateAccessToken(user) {
	return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" })
}

async function getSeller(req, res, next) {
	let seller
	try {
		seller = await Seller.findById(req.params.id)
		if (seller == null) {
			return res.status(404).json({ message: "Cannot find seller" })
		}
	} catch (err) {
		return res.status(500).json({ message: err.message })
	}

	res.seller = seller
	next()
}

module.exports = router
