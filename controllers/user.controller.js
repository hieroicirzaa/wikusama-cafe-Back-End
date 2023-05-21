
const userModel = require(`../models/index`).user
const Op = require(`sequelize`).Op
const md5 = require(`md5`)
const joi = require(`joi`)

const validateUser = (input) => {
  let rules = joi.object().keys({
    nama_user: joi
      .string()
      .required(),
    role: joi
      .string()
      .valid(`admin`, `kasir`, `manajer`)
      .required(),
    username: joi
      .string()
      .required(),
    password: joi
      .string()
      .min(8)
      .required()
  })
  let { error } = rules.validate(input)
  if (error) {
    let message = error
      .details
      .map(item => item.message)
      .join(`,`)

    return {
      status: false,
      message: message
    }
  }
  return {
    status: true
  }
}

exports.getAllUser = async (request, response) => {
  try {
    let user = await userModel.findAll()
    return response.json({
      success: true,
      data: user,
      message: `semua data user berhasil didapatkan`
    })
  } catch (error) {
    return response.json({
      status: false,
      message: error.message
    })
  }

}
exports.findUser = async (request, response) => {
  try {
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
      message: `data user berhasil dapat ditemukan`
    })
  } catch (error) {
    return response.json({
      status: false,
      message: error.message
    })
  }
}

exports.addUser = async (request, response) => {
  try {
    let resultValidation = validateUser(request.body)
    if (resultValidation.status === false) {
      return response.json({
        status: false,
        message: resultValidation.message
      })
    }
    request.body.password = md5(request.body.password)

    await userModel.create(request.body)
      .then(result => {
        return response.json({
          success: true,
          data: result,
          message: `data user berhasil ditambahkan`
        })
      })
      .catch(error => {
        return response.json({
          success: false,
          message: error.message
        })
      })
  } catch (error) {
    return response.json({
      status: false,
      message: error.message
    })
  }

}

exports.updateUser = async (request, response) => {
  try {
    let idUser = request.params.id

    let resultValidation = validateUser(request.body)
    if (resultValidation.status === false) {
      return response.json({
        status: false,
        message: resultValidation.message
      })
    }
    if (request.body.password) {
      request.body.password = md5(request.body.password)
    }

    await userModel.update(request.body, { where: { id: idUser } })
      .then(result => {
        return response.json({
          success: true,
          data: request.body,
          message: `Data user has been updated`
        })
      })
      .catch(error => {
        return response.json({
          success: false,
          message: error.message
        })
      })
  } catch (error) {
    return response.json({
      status: false,
      message: error.message
    })
  }
}

exports.deleteUser = async (request, response) => {
  try {
    let idUser = request.params.id
    await userModel.destroy({ where: { id: idUser } })
    return response.json({
      status: true,
      message: `Data user berhasil dihapus`
    })
  } catch (error) {
    return response.json({
      status: false,
      message: error.message
    })
  }

}
