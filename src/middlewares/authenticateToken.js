const jwt = require("jsonwebtoken")

function authenticate(req, res, next) {
	const authHeader = req.headers["authorization"]
	const token = authHeader && authHeader.split(" ")[1]
	if (token == null) return res.sendStatus(401)

	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, any_user) => {
		if (err) return res.sendStatus(403)
		req.any_user = any_user
		next()
	})
}

module.exports = authenticate