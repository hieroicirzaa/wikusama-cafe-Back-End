const express = require(`express`)
const app = express()

app.use(express.json())

const menuController = require(`../controllers/menu.controller`)
const authController = require(`../controllers/auth.controller`)

app.get("/getAllMenu", authController.authorization, menuController.getAllMenu)
app.post("/addMenu", authController.authorization, menuController.addMenu)
app.post("/find", authController.authorization, menuController.findMenu)
app.put("/:id", authController.authorization, menuController.updateMenu)
app.delete("/:id", authController.authorization, menuController.deleteMenu)

module.exports = app
