'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('detail_transaksis', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_transaksi: {
        type: Sequelize.INTEGER,
        allowNull:false,
        references:{
          model:'transaksis',
          key:'id'
        }
      },
      id_menu: {
        type: Sequelize.INTEGER,
        allowNull:false,
        references:{
          model:'menus',
          key:'id'
        }
      },
      harga: {
        type: Sequelize.INTEGER
      },
      qty: {
        type: Sequelize.INTEGER(11)
      },
      total_harga: {
        type: Sequelize.INTEGER
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
    await queryInterface.dropTable('detail_transaksis');
  }
};