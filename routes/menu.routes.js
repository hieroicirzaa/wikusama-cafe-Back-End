const express = require(`express`)
const app = express()

app.use(express.json())

const menuController = require(`../controllers/menu.controller`)
app.get("/getAllMenu", menuController.getAllMenu)
app.post("/addMenu", menuController.addMenu)
app.post("/find", menuController.findMenu)
app.put("/:id", menuController.updateMenu)
app.delete("/:id", menuController.deleteMenu)

module.exports = app
