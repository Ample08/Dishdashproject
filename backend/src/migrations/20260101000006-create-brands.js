'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('brands', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      brand_key: {
        type: Sequelize.STRING(40),
        allowNull: false,
        unique: true,
      },
      name: {
        type: Sequelize.STRING(80),
        allowNull: false,
      },
      cuisine: Sequelize.STRING(120),
      tagline: Sequelize.STRING(200),
      rating: {
        type: Sequelize.DECIMAL(2, 1),
        defaultValue: 0,
      },
      rating_count: Sequelize.STRING(20),
      price_level: Sequelize.STRING(10),
      tags: Sequelize.STRING(120),
      color: Sequelize.STRING(20),
      logo_key: Sequelize.STRING(60),
      branch: Sequelize.STRING(80),
      distance: Sequelize.STRING(20),
      address: Sequelize.STRING(160),
      prep_time: Sequelize.STRING(80),
      categories: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      sort_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('brands');
  },
};
