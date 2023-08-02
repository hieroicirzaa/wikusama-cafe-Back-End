
const mejaModel = require(`../models/index`).meja
const Op = require(`sequelize`).Op
const joi = require(`joi`)

const validateMeja = (input) => {
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
exports.statusMeja = async (request, response) => {
  try {
    const param = { status: request.params.status };
    const meja = await mejaModel.findAll({ where: param });
    if (meja.length > 0) { // jika data ditemukan
      return response.json({ // mengembalikan response dengan status code 200 dan data meja
        status: "success",
        data: meja,
      });
    } else { // jika data tidak ditemukan
      return response.status(404).json({ // mengembalikan response dengan status code 404 dan pesan data tidak ditemukan
        status: "error",
        message: "data tidak ditemukan",
      });
    }
  } catch (error) { // jika gagal
    return response.status(400).json({ // mengembalikan response dengan status code 400 dan pesan error
      status: "error",
      message: error.message,
    });
  }
};