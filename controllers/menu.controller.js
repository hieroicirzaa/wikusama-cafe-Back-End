
const { Op } = require(`sequelize`)
const menuModel = require(`../models/index`).menu
const query = require('sequelize').Op
const path = require('path')
const fs = require('fs')
const joi = require(`joi`)
const upload = require(`./upload_gambar`).single('gambar')

const validateMenu = (input) => {
  let rules = joi.object().keys({
    nama_menu: joi
      .string()
      .required(),
    jenis: joi
      .string()
      .valid(`makanan`, `minuman`)
      .required(),
    deskripsi: joi
      .string()
      .required(),
    harga: joi
      .number()
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

exports.getAllMenu = async (request, response) => {
  try {
    let menu = await menuModel.findAll()
    return response.json({
      success: true,
      data: menu,
      message: `mendapatkan semua data menu `
    })
  } catch (error) {
    return response.json({
      status: false,
      message: error.message
    })
  }
}

exports.findMenu = async (request, response) => {
  try {
    let keyword = request.body.keyword
    let menu = await menuModel.findAll({
      where: {
        [query.or]: [
          { nama_menu: { [Op.substring]: keyword } },
          { jenis: { [Op.substring]: keyword } },
          { deskripsi: { [Op.substring]: keyword } },
          { harga: { [Op.substring]: keyword } }
        ]
      }
    })
    return response.json({
      success: true,
      data: menu,
      message: `data menu ditemukan`
    })
  } catch (error) {
    return response.json({
      status: false,
      message: error.message
    })
  }
}

exports.addMenu = async (request, response) => {
  try {
    upload(request, response, async (error) => {
      if (error) {
        return response.json({ message: error })
      }
      if (!request.file) {
        return response.json({
          message: `Nothing to Upload`
        })
      }
      let resultValidation = validateMenu(request.body)
      if (resultValidation.status === false) {
        return response.json({
          status: false,
          message: resultValidation.message
        })
      }

      request.body.gambar = request.file.filename

      await menuModel.create(request.body)
        .then(result => {
          return response.json({
            success: true,
            data: result,
            message: `data menu berhasil ditambahkan`
          })
        })
        .catch(error => {
          return response.json({
            success: false,
            message: error.message
          })
        })
    })
  } catch (error) {
    return response.json({
      status: false,
      message: error.message
    })
  }
}

exports.updateMenu = async (request, response) => {
  try {
    upload(request, response, async (error) => {
      if (error) {
        return response.json({ message: error });
      }
      let id = request.params.id;

      let resultValidation = validateMenu(request.body);
      if (resultValidation.status === false) {
        return response.json({
          status: false,
          message: resultValidation.message,
        });
      }

      if (request.file) {
        // Hanya jika ada gambar yang diunggah baru, Anda perlu mengelola gambar
        const selectedMenu = await menuModel.findOne({
          where: { id: id },
        });
        const oldGambarMenu = selectedMenu.gambar;
        const pathGambar = path.join(__dirname, '../gambar', oldGambarMenu);
        if (fs.existsSync(pathGambar)) {
          fs.unlink(pathGambar, (error) => console.log(error));
        }
        request.body.gambar = request.file.filename;
      }

      await menuModel
        .update(request.body, { where: { id: id } })
        .then((result) => {
          return response.json({
            success: true,
            data: request.body,
            message: `Data menu berhasil terupdate`,
          });
        })
        .catch((error) => {
          return response.json({
            success: false,
            message: error.message,
          });
        });
    });
  } catch (error) {
    return response.json({
      status: false,
      message: error.message,
    });
  }
};

exports.deleteMenu = async (request, response) => {
  try {
    const id = request.params.id
    const menu = await menuModel.findOne({ where: { id: id } })
    const oldGambarMenu = menu.gambar

    const pathGambar = path.join(__dirname, `../gambar`, oldGambarMenu)
    if (fs.existsSync(pathGambar)) {
      fs.unlink(pathGambar, error => console.log(error))
    }
    else {
      console.log(`not existing gambar`)
    }
    await menuModel.destroy({ where: { id: id } })
    return response.json({
      status: true,
      message: `Data menu berhasil dihapus`
    })
  } catch (error) {
    return response.json({
      status: false,
      message: error.message
    })
  }
}