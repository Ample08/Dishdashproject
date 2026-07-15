module.exports = (sequelize, DataTypes) => {
  const Flavour = sequelize.define(
    'Flavour',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      description: DataTypes.TEXT,
      category: {
        type: DataTypes.STRING(80),
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      image_url: DataTypes.STRING(500),
      is_available: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      average_score: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 0,
      },
      total_reviews: {
        type: DataTypes.INTEGER.UNSIGNED,
        defaultValue: 0,
      },
    },
    { tableName: 'flavours' }
  );

  Flavour.associate = (models) => {
    Flavour.hasMany(models.Review, { foreignKey: 'flavour_id', as: 'reviews' });
  };

  return Flavour;
};
