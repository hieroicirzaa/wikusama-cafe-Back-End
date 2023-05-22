const express = require(`express`)
const app = express()

app.use(express.json())

const userController = require(`../controllers/user.controller`)
const authController = require(`../controllers/auth.controller`)

app.get("/getAllUser", authController.authorization, userController.getAllUser)
app.post("/addUser", authController.authorization, userController.addUser)
app.post("/find", authController.authorization, userController.findUser)
app.put("/:id", authController.authorization, userController.updateUser)
app.delete("/:id", authController.authorization, userController.deleteUser)

module.exports = app
