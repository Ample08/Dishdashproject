'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('menu_items', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      slug: {
        type: Sequelize.STRING(80),
        allowNull: false,
        unique: true,
      },
      brand_key: {
        type: Sequelize.STRING(40),
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(120),
        allowNull: false,
      },
      description: Sequelize.TEXT,
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      old_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      discount_pct: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      category: {
        type: Sequelize.STRING(60),
        allowNull: false,
      },
      image_key: Sequelize.STRING(60),
      popular: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      sold_out: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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

    await queryInterface.addIndex('menu_items', ['brand_key']);
    await queryInterface.addIndex('menu_items', ['category']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('menu_items');
  },
};
