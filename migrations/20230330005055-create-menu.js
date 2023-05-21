'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('menus', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER(11)
      },
      nama_menu: {
        type: Sequelize.STRING(100)
      },
      jenis: {
        type: Sequelize.ENUM('makanan', 'minuman')
      },
      deskripsi: {
        type: Sequelize.TEXT
      },
      gambar: {
        type: Sequelize.STRING(255)
      },
      harga: {
        type: Sequelize.INTEGER(11)
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
    await queryInterface.dropTable('menus');
  }
};