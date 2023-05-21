
const userModel = require(`../models/index`).user
const Op = require(`sequelize`).Op
const md5 = require(`md5`)

exports.getAllUser = async (request, response) => {
  let user = await userModel.findAll()
  return response.json({
    success: true,
    data: user,
    message: `All user have been loaded`
  })
}
exports.findUser = async (request, response) => {
  let keyword = request.body.keyword
  let user = await userModel.findAll({
    where: {
      [Op.or]: [
        { nama_user: { [Op.substring]: keyword } },
        { role: { [Op.substring]: keyword } },
        { username: { [Op.substring]: keyword } }


      ]
    }
  })
  return response.json({
    success: true,
    data: user,
    message: `All user have been loaded`
  })
}

exports.addUser = (request, response) => {
  let newUser = {
    nama_user: request.body.nama_user,
    role: request.body.role,
    username: request.body.username,
    password: md5(request.body.password)
  }
  userModel.create(newUser)
    .then(result => {
      return response.json({
        success: true,
        data: result,
        message: `New user has been inserted`
      })
    })
    .catch(error => {
      return response.json({
        success: false,
        message: error.message
      })
    })
}

exports.updateUser = (request, response) => {
  let dataUser = {
    nama_user: request.body.nama_user,
    role: request.body.role,
    username: request.body.username,
    password: md5(request.body.password)
  }
  let idUser = request.params.id
  userModel.update(dataUser, { where: { id: idUser } })
    .then(result => {
      return response.json({
        success: true,
        message: `Data user has been updated`
      })
    })
    .catch(error => {
      return response.json({
        success: false,
        message: error.message
      })
    })
}

exports.deleteUser = (request, response) => {
  let idUser = request.params.id
  userModel.destroy({ where: { id: idUser } })
    .then(result => {
      return response.json({
        success: true,
        message: `Data user has been updated`
      })
    })
    .catch(error => {
      return response.json({
        success: false,
        message: error.message
      })
    })
}
