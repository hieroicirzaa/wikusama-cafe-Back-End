
const mejaModel = require(`../models/index`).meja
const Op = require(`sequelize`).Op
const joi = require(`joi`)

const validateMeja = async (input) => {
  let rules = joi.object().keys({
    nomor_meja: joi
      .string()
      .required(),
    status: joi
      .string()
      .valid(`kosong`, `terisi`)
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

exports.getAllMeja = async (request, response) => {
  try {
    let meja = await mejaModel.findAll()
    return response.json({
      success: true,
      data: meja,
      message: `semua meja berhasil ditemukan`
    })
  } catch (error) {
    return response.json({
      status: false,
      message: error.message
    })
  }

}

exports.findMeja = async (request, response) => {
  try {
    let keyword = request.body.keyword
    let meja = await mejaModel.findAll({
      where: {
        [Op.or]: [
          { nomor_meja: { [Op.substring]: keyword } },
          { status: { [Op.substring]: keyword } }
        ]
      }
    })
    return response.json({
      success: true,
      data: meja,
      message: `meja berhasil ditemukan`
    })
  } catch (error) {
    return response.json({
      status: false,
      message: error.message
    })
  }
}


exports.addMeja = async (request, response) => {
  try {
    let resultValidation = validateMeja(request.body)
    if (resultValidation.status === false) {
      return response.json({
        status: false,
        message: resultValidation.message
      })
    }
    await mejaModel.create(request.body)
    .then(result => {
      return response.json({
        success: true,
        data: result,
        message: `data meja berhasil ditambahkan`
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

exports.updateMeja = async (request, response) => {
  let idMeja = request.params.id

  let resultValidation = validateMeja(request.body)
  if (resultValidation.status == false) {
    return response.json({
      status: false,
      message: resultValidation.message
    })
  }

  await mejaModel.update(request.body, { where: { id: idMeja } })
    .then(result => {
      return response.json({
        success: true,
        data: request.body,
        message: `Data meja berhasil diupdate`
      })
    })
    .catch(error => {
      return response.json({
        success: false,
        message: error.message
      })
    })
}

exports.deleteMeja = async (request, response) => {
  try {
    let idMeja = request.params.id
    await mejaModel.destroy({ where: { id: idMeja } })
    return response.json({
      status: true,
      message: `Data meja berhasil dihapus`
  })
  } catch (error) {
    return response.json({
      status: false,
      message: error.message
    })
  }
}