module.exports = (sequelize, DataTypes) => {
  const Brand = sequelize.define(
    'Brand',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      brand_key: {
        type: DataTypes.STRING(40),
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING(80),
        allowNull: false,
      },
      cuisine: DataTypes.STRING(120),
      tagline: DataTypes.STRING(200),
      rating: {
        type: DataTypes.DECIMAL(2, 1),
        defaultValue: 0,
      },
      rating_count: DataTypes.STRING(20),
      price_level: DataTypes.STRING(10),
      tags: DataTypes.STRING(120),
      color: DataTypes.STRING(20),
      logo_key: DataTypes.STRING(60),
      branch: DataTypes.STRING(80),
      distance: DataTypes.STRING(20),
      address: DataTypes.STRING(160),
      prep_time: DataTypes.STRING(80),
      categories: DataTypes.JSON,
      sort_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    { tableName: 'brands' }
  );

  Brand.associate = (models) => {
    Brand.hasMany(models.MenuItem, {
      foreignKey: 'brand_key',
      sourceKey: 'brand_key',
      as: 'items',
    });
  };

  return Brand;
};
