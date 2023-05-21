const express = require(`express`)
const app = express()
// const { authorize } = require(`../controllers/auth.controller`)
// let validationUser = require(`../middlewares/user-validation`)
app.use(express.json())

// const userController = require(`../controllers/User.controller`)
// app.get("/getAllUser", [authorize], userController.getAllUser)
// app.post("/addUser",validationUser, [authorize], userController.addUser)
// app.post("/find", [authorize], userController.findUser)
// app.put("/:id",validationUser, [authorize], userController.updateUser)
// app.delete("/:id", [authorize], userController.deleteUser)

const userController = require(`../controllers/user.controller`)
app.get("/getAllUser", userController.getAllUser)
app.post("/addUser", userController.addUser)
app.post("/find", userController.findUser)
app.put("/:id", userController.updateUser)
app.delete("/:id", userController.deleteUser)

module.exports = app
