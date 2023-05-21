'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('transaksis', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER(11)
      },
      tgl_transaksi: {
        allowNull: false,
        type: "TIMESTAMP",
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      id_user: {
        type: Sequelize.INTEGER(11),
        allowNull:false,
        references:{
          model:'users',
          key:'id'
        }
      },
      id_meja: {
        type: Sequelize.INTEGER(11),
        allowNull:false,
        references:{
          model:'mejas',
          key:'id'
        }
      },
      nama_pelanggan: {
        type: Sequelize.STRING(100)
      },
      status: {
        type: Sequelize.ENUM('belum_bayar', 'lunas')
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('transaksis');
  }
};