'use strict';

/** Experience bookings made with loyalty points. */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('loyalty_bookings', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      booking_key: {type: Sequelize.STRING(40), allowNull: false, unique: true},
      user_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {model: 'users', key: 'id'},
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      exp_key: Sequelize.STRING(40),
      brand: Sequelize.STRING(40),
      title: Sequelize.STRING(120),
      date_label: Sequelize.STRING(60),
      location: Sequelize.STRING(120),
      in_days: {type: Sequelize.INTEGER, defaultValue: 0},
      past: {type: Sequelize.BOOLEAN, defaultValue: false},
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
    await queryInterface.addIndex('loyalty_bookings', ['user_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('loyalty_bookings');
  },
};
