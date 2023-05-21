const express = require(`express`)
const app = express()

app.use(express.json())

const mejaController = require(`../controllers/meja.controller`)
app.get("/getAllMeja", mejaController.getAllMeja)
app.post("/addMeja", mejaController.addMeja)
app.post("/find", mejaController.findMeja)
app.put("/:id", mejaController.updateMeja)
app.delete("/:id", mejaController.deleteMeja)

module.exports = app
