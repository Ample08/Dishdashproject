'use strict';

/**
 * Phone/OTP auth support:
 *  - users.email & users.password become nullable (phone-first signup)
 *  - users.phone gets a unique index
 *  - new otp_codes table for one-time codes
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('users', 'email', {
      type: Sequelize.STRING(150),
      allowNull: true,
      unique: true,
    });

    await queryInterface.changeColumn('users', 'password', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await queryInterface.addIndex('users', ['phone'], {
      unique: true,
      name: 'users_phone_unique',
    });

    await queryInterface.createTable('otp_codes', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      code: {
        type: Sequelize.STRING(6),
        allowNull: false,
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      consumed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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

    await queryInterface.addIndex('otp_codes', ['phone']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('otp_codes');
    await queryInterface.removeIndex('users', 'users_phone_unique');
    await queryInterface.changeColumn('users', 'password', {
      type: Sequelize.STRING(255),
      allowNull: false,
    });
    await queryInterface.changeColumn('users', 'email', {
      type: Sequelize.STRING(150),
      allowNull: false,
      unique: true,
    });
  },
};
