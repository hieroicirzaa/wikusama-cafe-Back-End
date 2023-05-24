const express = require(`express`)
const app = express()

app.use(express.json())

const mejaController = require(`../controllers/meja.controller`)
const authController = require(`../controllers/auth.controller`)

app.get("/getAllMeja", authController.authorization, mejaController.getAllMeja)
app.post("/addMeja", authController.authorization, mejaController.addMeja)
app.post("/find", authController.authorization, mejaController.findMeja)
app.put("/:id", authController.authorization, mejaController.updateMeja)
app.delete("/:id", authController.authorization, mejaController.deleteMeja)
app.get(`/status/:status`,authController.authorization, mejaController.statusMeja)
module.exports = app
