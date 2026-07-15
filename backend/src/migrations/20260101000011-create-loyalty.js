'use strict';

/**
 * Loyalty: points balance on users, per-user vouchers + point history,
 * and the experiences catalog.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'loyalty_points', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1550,
    });

    await queryInterface.createTable('experiences', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      exp_key: {type: Sequelize.STRING(40), allowNull: false, unique: true},
      brand: Sequelize.STRING(40),
      title: Sequelize.STRING(120),
      location: Sequelize.STRING(120),
      description: Sequelize.TEXT,
      pts: {type: Sequelize.INTEGER, defaultValue: 0},
      value: Sequelize.STRING(40),
      tags: Sequelize.JSON,
      eligible: {type: Sequelize.BOOLEAN, defaultValue: true},
      need_more: Sequelize.INTEGER,
      photo_key: Sequelize.STRING(60),
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

    await queryInterface.createTable('vouchers', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {model: 'users', key: 'id'},
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      voucher_key: Sequelize.STRING(40),
      kind: Sequelize.STRING(20),
      label: Sequelize.STRING(60),
      title: Sequelize.STRING(60),
      discount: Sequelize.STRING(20),
      scope: Sequelize.STRING(60),
      sub: Sequelize.STRING(80),
      action: Sequelize.STRING(20),
      status: {type: Sequelize.STRING(20), defaultValue: 'available'},
      code: Sequelize.STRING(40),
      guests: Sequelize.INTEGER,
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
    await queryInterface.addIndex('vouchers', ['user_id']);

    await queryInterface.createTable('point_history', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {model: 'users', key: 'id'},
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      title: Sequelize.STRING(120),
      sub: Sequelize.STRING(160),
      delta: {type: Sequelize.INTEGER, defaultValue: 0},
      icon: Sequelize.STRING(40),
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
    await queryInterface.addIndex('point_history', ['user_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('point_history');
    await queryInterface.dropTable('vouchers');
    await queryInterface.dropTable('experiences');
    await queryInterface.removeColumn('users', 'loyalty_points');
  },
};
