module.exports = (sequelize, DataTypes) => {
  const MenuItem = sequelize.define(
    'MenuItem',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      slug: {
        type: DataTypes.STRING(80),
        allowNull: false,
        unique: true,
      },
      brand_key: {
        type: DataTypes.STRING(40),
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      description: DataTypes.TEXT,
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      old_price: DataTypes.DECIMAL(10, 2),
      discount_pct: DataTypes.INTEGER,
      category: {
        type: DataTypes.STRING(60),
        allowNull: false,
      },
      image_key: DataTypes.STRING(60),
      popular: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      sold_out: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      sort_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    { tableName: 'menu_items' }
  );

  MenuItem.associate = (models) => {
    MenuItem.belongsTo(models.Brand, {
      foreignKey: 'brand_key',
      targetKey: 'brand_key',
      as: 'brand',
    });
  };

  return MenuItem;
};
