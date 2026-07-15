'use strict';

/** Catering inquiries submitted by users. */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('catering_inquiries', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      inquiry_ref: {type: Sequelize.STRING(24), allowNull: false, unique: true},
      user_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: {model: 'users', key: 'id'},
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      event_type: Sequelize.STRING(40),
      title: Sequelize.STRING(160),
      guests: {type: Sequelize.INTEGER, defaultValue: 0},
      date_label: Sequelize.STRING(40),
      location: Sequelize.STRING(120),
      budget: Sequelize.STRING(60),
      requirements: Sequelize.TEXT,
      name: Sequelize.STRING(120),
      email: Sequelize.STRING(150),
      phone: Sequelize.STRING(40),
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'awaiting',
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
    await queryInterface.addIndex('catering_inquiries', ['user_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('catering_inquiries');
  },
};
