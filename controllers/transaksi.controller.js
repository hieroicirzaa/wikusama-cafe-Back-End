const { transaksi: transaksiModel, detail_transaksi: detailTransaksiModel, menu: menuModel, meja: mejaModel, user: userModel } = require("../models/index");
const { Op, fn, col, Sequelize } = require("sequelize"); // import operator sequelize

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

    if (meja.status === "terisi" && kondisiStatus === "belum_bayar") {
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
      message: `data Transaksi berhasil ditambahkan`
    });
  } catch (error) {
    return response.json({
      success: false,
      message: error.message
    });
  }
};

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

    await transaksiModel.update({ status: "lunas" }, { where: { id: id_transaksi } });

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
      message: "transaksi Menu berhasil dihapus"
    });
  } catch (error) {
    return response.json({
      success: false,
      message: error.message
    });
  }
};

exports.getTransaksi = async (request, response) => {
  try {
    let result = await transaksiModel.findAll({
      order:[["tgl_transaksi", "DESC"]],
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

exports.filterTransaksi = async (request, response) => {
  try {
    const keyword = request.body.keyword;

    const data = await transaksiModel.findAll({
      where: {
        [Op.or]: [
          { nama_pelanggan: { [Op.substring]: keyword } },
          { tgl_transaksi: { [Op.substring]: keyword } },
          { status: { [Op.substring]: keyword } },
          // Pencarian berdasarkan "nama_user" di tabel "user"
          { '$user.nama_user$': { [Op.substring]: keyword } },
          // Pencarian berdasarkan "nama_menu" di tabel "menu" pada tabel "detail_transaksi"
          { '$detail_transaksi.menu.nama_menu$': { [Op.substring]: keyword } },
          // Pencarian berdasarkan "nomor_meja" di tabel "meja"
          { '$meja.nomor_meja$': { [Op.substring]: keyword } },
          // Pencarian berdasarkan "harga" di tabel "detail_transaksi"
          { '$detail_transaksi.total_harga$': { [Op.substring]: keyword } },
        ],
      },
      include: [
        {
          model: mejaModel,
          as: "meja",
        },
        {
          model: detailTransaksiModel,
          as: "detail_transaksi",
          include: [{ model: menuModel, as: "menu" }],
        },
        {
          model: userModel,
          as: "user",
        },
      ],
    });

    return response.json({
      success: true,
      data: data,
      message: "Data transaksi berhasil ditemukan berdasarkan pencarian",
    });
  } catch (error) {
    return response.json({
      success: false,
      message: error.message,
    });
  }
};

//Endpoint untuk Menghitung Total Pendapatan untuk Semua Transaksi pada Tanggal Tertentu:
exports.totalPendapatanTanggal = async (request, response) => {
  try {
    const { startDate, endDate } = request.body;

    const totalPendapatan = await transaksiModel.findAll({
      raw: true,
      attributes: [
        [fn('SUM', col('detail_transaksi.harga')), 'total_income']
      ],
      where: {
        tgl_transaksi: {
          [Op.between]: [`${startDate} 00:00:00`, `${endDate} 23:59:59`]
        }
      },
      include: [
        {
          model: detailTransaksiModel,
          as: 'detail_transaksi',
          attributes: []
        }
      ]
    });

    return response.json({
      success: true,
      data: totalPendapatan,
      message: 'Total pendapatan berhasil dihitung berdasarkan tanggal'
    });
  } catch (error) {
    return response.json({
      success: false,
      message: error.message
    });
  }
};

//endpoint yang menghitung total pendapatan bulanan berdasarkan bulan dan tahun yang diinputkan
exports.totalPendapatanBulanan = async (request, response) => {
  try {
    const { startMonth, endMonth, startYear, endYear } = request.body;

    const totalPendapatan = await transaksiModel.findAll({
      raw: true,
      attributes: [
        [fn('SUM', col('detail_transaksi.harga')), 'total_income']
      ],
      where: {
        tgl_transaksi: {
          [Op.and]: [
            { [Op.gte]: `${startYear}-${startMonth}-01 00:00:00` },
            { [Op.lte]: `${endYear}-${endMonth}-31 23:59:59` }
          ]
        }
      },
      include: [
        {
          model: detailTransaksiModel,
          as: 'detail_transaksi',
          attributes: []
        }
      ]
    });

    return response.json({
      success: true,
      data: totalPendapatan,
      message: 'Total pendapatan bulanan berhasil dihitung'
    });
  } catch (error) {
    return response.json({
      success: false,
      message: error.message
    });
  }
};

//endpoint yang menghitung total pendapatan tahunan berdasarkan tahun yang diinputkan:
exports.totalPendapatanTahunan = async (request, response) => {
  try {
    const { startYear, endYear } = request.body;

    const totalPendapatan = await transaksiModel.findAll({
      raw: true,
      attributes: [
        [fn('SUM', col('detail_transaksi.harga')), 'total_income']
      ],
      where: {
        tgl_transaksi: {
          [Op.between]: [`${startYear}-01-01 00:00:00`, `${endYear}-12-31 23:59:59`]
        }
      },
      include: [
        {
          model: detailTransaksiModel,
          as: 'detail_transaksi',
          attributes: []
        }
      ]
    });

    return response.json({
      success: true,
      data: totalPendapatan,
      message: 'Total pendapatan tahunan berhasil dihitung'
    });
  } catch (error) {
    return response.json({
      success: false,
      message: error.message
    });
  }
};


// Endpoint untuk mendapatkan data statistik makanan dan minuman terlaris
exports.statistik_makanan_minuman_terlaris = async (request, response) => {
  try {
    const statistik = await detailTransaksiModel.findAll({
      attributes: [
        [Sequelize.literal('menu.nama_menu'), 'nama_menu'],
        [Sequelize.fn('SUM', Sequelize.col('qty')), 'total_pesanan']
      ],
      include: [
        {
          model: menuModel,
          as: 'menu',
          attributes: []
        }
      ],
      group: ['menu.nama_menu'],
      order: [[Sequelize.fn('SUM', Sequelize.col('qty')), 'DESC']]
    });

    return response.json({
      success: true,
      data: statistik,
      message: 'Berhasil mengambil data statistik'
    });
  } catch (error) {
    return response.json({
      success: false,
      message: error.message
    });
  }
};

// Endpoint untuk mendapatkan data statistik makanan dan minuman jarang dipesan
exports.statistik_makanan_minuman_sedikit = async (request, response) => {
  try {
    const statistik = await detailTransaksiModel.findAll({
      attributes: [
        [Sequelize.literal('menu.nama_menu'), 'nama_menu'],
        [Sequelize.fn('SUM', Sequelize.col('qty')), 'total_pesanan']
      ],
      include: [
        {
          model: menuModel,
          as: 'menu',
          attributes: []
        }
      ],
      group: ['menu.nama_menu'],
      order: [[Sequelize.fn('SUM', Sequelize.col('qty')), 'ASC']]
    });

    return response.json({
      success: true,
      data: statistik,
      message: 'Berhasil mengambil data statistik'
    });
  } catch (error) {
    return response.json({
      success: false,
      message: error.message
    });
  }
};
