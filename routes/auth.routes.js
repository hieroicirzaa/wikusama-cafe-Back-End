const express = require(`express`)
const app = express()

app.use(express.json())

const authController = require(`../controllers/auth.controller`)

app.post(`/authentication`, authController.authentication)
app.post(`/authorization`, authController.authorization)

module.exports = app