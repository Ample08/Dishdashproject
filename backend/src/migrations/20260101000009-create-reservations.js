'use strict';

/** Reservation branches (catalog) + user bookings. */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('branches', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      branch_key: {
        type: Sequelize.STRING(40),
        allowNull: false,
        unique: true,
      },
      name: {type: Sequelize.STRING(80), allowNull: false},
      area: Sequelize.STRING(160),
      rating: {type: Sequelize.DECIMAL(2, 1), defaultValue: 0},
      rating_count: Sequelize.STRING(20),
      tags: Sequelize.JSON,
      highlight: Sequelize.STRING(160),
      most_loved: Sequelize.STRING(80),
      facts: Sequelize.JSON,
      photo_key: Sequelize.STRING(60),
      photos: Sequelize.JSON,
      sort_order: {type: Sequelize.INTEGER, defaultValue: 0},
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

    await queryInterface.createTable('bookings', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      booking_ref: {type: Sequelize.STRING(24), allowNull: false, unique: true},
      user_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {model: 'users', key: 'id'},
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      restaurant: Sequelize.STRING(40),
      branch_key: Sequelize.STRING(40),
      branch_name: Sequelize.STRING(80),
      date_label: Sequelize.STRING(40),
      date_full: Sequelize.STRING(60),
      time_label: Sequelize.STRING(20),
      guests: {type: Sequelize.INTEGER, defaultValue: 2},
      seating_label: Sequelize.STRING(80),
      note: Sequelize.TEXT,
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
    await queryInterface.addIndex('bookings', ['user_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('bookings');
    await queryInterface.dropTable('branches');
  },
};
