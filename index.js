require('dotenv').config()

const express = require('express')
const app = express()
const mongoose = require('mongoose')


mongoose.connect(process.env.DATABASE_URL)
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to Database'))

app.use(express.json())

const mainRouter = express.Router()
app.use('/api', mainRouter)

const usersRouter = require('./src/routers/users')
mainRouter.use('/users', usersRouter)

const sellersRouter = require('./src/routers/sellers')
mainRouter.use('/sellers', sellersRouter)

app.listen(3000, () => console.log('Server running on port ', 3000))