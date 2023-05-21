const { transaksi: transaksiModel, detail_transaksi: detailTransaksiModel, menu: menuModel, meja: mejaModel, user: userModel } = require("../models/index");
const { Op, fn, col, literal } = require("sequelize"); // import operator sequelize

exports.addTransaksi = async (request, response) => {
  try {
    const currentDate = new Date();
    const newData = {
      tgl_transaksi: currentDate,
      id_user: request.body.id_user,
      id_meja: request.body.id_meja,
      nama_pelanggan: request.body.nama_pelanggan,
      status: request.body.status
    };

    //id meja
    const idMeja = request.body.id_meja;
    //kondisi status transaksi
    const kondisiStatus = request.body.status;
    //untuk mengecek meja
    const meja = await mejaModel.findOne({ where: { id: idMeja } });
    //
    if (meja.status ===     "terisi" && kondisiStatus === "belum_bayar") {
      return response.json({
        success: false,
        message: "Meja sedang terisi. Tidak dapat membuat transaksi."
      });
    }

    const dataNew = await transaksiModel.create(newData);

    if (dataNew.status == "belum_bayar") {
      await mejaModel.update({ status: "terisi" }, { where: { id: idMeja } });
    }

    const transaksiID = dataNew.id;
    const detailTransaksi = request.body.detail_transaksi;

    for (let i = 0; i < detailTransaksi.length; i++) {

      detailTransaksi[i].id_transaksi = transaksiID;

      const menu = await menuModel.findOne({ where: { id: detailTransaksi[i].id_menu } });

      detailTransaksi[i].harga = menu?.harga * detailTransaksi[i].qty;
    }
    //memasukan data ke tabel detail transaksi
    await detailTransaksiModel.bulkCreate(detailTransaksi);

    //mamasukan total_harga harga ke tabel detail transaksi
    const [result] = await detailTransaksiModel.findAll({
      attributes: [
        [fn('SUM', col('harga')), 'total_harga']
      ],
      where: { id_transaksi: transaksiID },
      raw: true
    });

    const totalHarga = result.total_harga || 0;

    await detailTransaksiModel.update({ total_harga: totalHarga }, { where: { id_transaksi: transaksiID } });

    return response.json({
      success: true,
      data: result,
      message: `New Menu Transaksi has been inserted`
    });
  } catch (error) {
    return response.json({
      success: false,
      message: error.message
    });
  }
};


/** create function for update  Transaksi */
exports.updateTransaksi = async (request, response) => {
  try {
    let id_transaksi = request.params.id_transaksi
    const currentDate = new Date();
    let newData = {
      tgl_transaksi: currentDate,
      id_user: request.body.id_user,
      id_meja: request.body.id_meja,
      nama_pelanggan: request.body.nama_pelanggan,
      status: request.body.status
    }

    //id meja
    const idMeja = request.body.id_meja;

    const dataNew = await transaksiModel.create(newData);
    //mengubah bangku jadi kosong bila update lunas
    if (dataNew.status == "lunas") {
      await mejaModel.update({ status: "kosong" }, { where: { id: idMeja } });
    }

    await transaksiModel.update(newData, { where: { id: id_transaksi } })
    await detailTransaksiModel.destroy({ where: { id_transaksi: id_transaksi } })

    let detailTransaksi = request.body.detail_transaksi
    for (let i = 0; i < detailTransaksi.length; i++) {
      detailTransaksi[i].id_transaksi = id_transaksi
      let menu = await menuModel.findOne({ where: { id: detailTransaksi[i].id_menu } })
      detailTransaksi[i].harga = menu?.harga * detailTransaksi[i].qty
    }

    await detailTransaksiModel.bulkCreate(detailTransaksi)
    //mamasukan total_harga harga ke tabel detail transaksi
    const [result] = await detailTransaksiModel.findAll({
      attributes: [
        [fn('SUM', col('harga')), 'total_harga']
      ],
      where: { id_transaksi: id_transaksi },
      raw: true
    });

    const totalHarga = result.total_harga || 0;

    await detailTransaksiModel.update({ total_harga: totalHarga }, { where: { id_transaksi: id_transaksi } });

    return response.json({
      status: true,
      message: `Data transaksi berhasil diubah`
    })
  } catch (error) {
    return response.json({
      status: false,
      message: error.message
    })
  }
}
//Update transaksi status by id
exports.updateStatusTransaksi = async (request, response) => {
  try {
    let id_transaksi = request.params.id_transaksi

    //id meja
    const id_Meja = await transaksiModel.findOne({ where: { id: id_transaksi } });
    
    await mejaModel.update({ status: "kosong" }, { where: { id: id_Meja.id_meja } });   

    await transaksiModel.update({status: "lunas"}, { where: { id: id_transaksi } });

    return response.json({
      status: true,
      message: `Status transaksi berhasil diubah`
    })
  } catch (error) {
    return response.json({
      status: false,
      message: error.message
    })
  }
}

exports.deleteTransaksi = async (request, response) => {
  try {
    const transaksiID = request.params.id_transaksi;
    await detailTransaksiModel.destroy({ where: { id_transaksi: transaksiID } });
    await transaksiModel.destroy({ where: { id: transaksiID } });

    return response.json({
      success: true,
      message: "transaksi Menu's has been deleted"
    });
  } catch (error) {
    return response.json({
      success: false,
      message: error.message
    });
  }
};

/** create function for get all transaksiing data */
exports.getTransaksi = async (request, response) => {
  try {
    let result = await transaksiModel.findAll({
      include: [
        "user", "meja", {
          model: detailTransaksiModel,
          as: "detail_transaksi",
          include: ["menu"]
        }
      ]
    })
    return response.json({
      status: true,
      data: result
    })
  } catch (error) {
    return response.json({
      status: false,
      message: error.message
    })
  }
}

/** create function for get filter transaksi data id admin and id member */
exports.filterTransaksi = async (request, response) => {
  try {
    const keyword = request.body.keyword;

    const data = await transaksiModel.findAll({
      where: {
        [Op.or]: [
          { tgl_transaksi: { [Op.substring]: keyword } },
          { id_user: { [Op.substring]: keyword } },
          { id_meja: { [Op.substring]: keyword } },
          { status: { [Op.substring]: keyword } },
          { nama_pelanggan: { [Op.substring]: keyword } }
        ]
      },
      include: [
        { model: mejaModel, as: "meja" },
        { model: detailTransaksiModel, as: "detail_transaksi", include: [{ model: menuModel, as: "menu" }] },
        { model: userModel, as: "user" }
      ]
    });

    return response.json({
      success: true,
      data: data,
      message: "All transaksi have been loaded"
    });
  } catch (error) {
    return response.json({
      success: false,
      message: error.message
    });
  }
};

//pemdapatam berdasarkan tanggal, bulanan dan tahunan
exports.jumlahPendapatan = async (request, response) => {
  try {
    const { date, month, year } = request.body;

    let whereCondition = {};
    let groupBy = [];

    if (date) {
      whereCondition = {
        tgl_transaksi: {
          [Op.between]: [`${date} 00:00:00`, `${date} 23:59:59`]
        }
      };
      groupBy = ['tgl_transaksi'];
    } else if (month) {
      whereCondition = literal(`MONTH(tgl_transaksi) = ${month}`);
      groupBy = [literal('YEAR(tgl_transaksi)'), literal('MONTH(tgl_transaksi)')];
    } else if (year) {
      whereCondition = literal(`YEAR(tgl_transaksi) = ${year}`);
      groupBy = [literal('YEAR(tgl_transaksi)')];
    }

    const result = await transaksiModel.findAll({
      attributes: [
        [fn('SUM', col('detail_transaksi.harga')), 'total_income']
      ],
      where: whereCondition,
      include: [
        {
          model: detailTransaksiModel,
          as: 'detail_transaksi',
          attributes: []
        }
      ],
      group: groupBy
    });

    return response.json({
      success: true,
      data: result,
      message: 'Income calculated successfully.'
    });
  } catch (error) {
    return response.json({
      success: false,
      message: error.message
    });
  }
};