module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define(
    'Order',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      order_ref: {
        type: DataTypes.STRING(24),
        allowNull: false,
        unique: true,
      },
      user_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      brand_key: {
        type: DataTypes.STRING(40),
        allowNull: false,
      },
      branch: DataTypes.STRING(80),
      item_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      service_fee: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      vat: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      total: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      payment_method: DataTypes.STRING(20),
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'placed',
      },
      placed_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    { tableName: 'orders' }
  );

  Order.associate = (models) => {
    Order.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    Order.hasMany(models.OrderItem, {
      foreignKey: 'order_id',
      as: 'items',
      onDelete: 'CASCADE',
    });
  };

  return Order;
};
