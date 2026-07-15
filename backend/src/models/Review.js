module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define(
    'Review',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      flavour_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      score: {
        type: DataTypes.TINYINT.UNSIGNED,
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
        },
      },
      comment: DataTypes.TEXT,
    },
    { tableName: 'reviews' }
  );

  Review.associate = (models) => {
    Review.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    Review.belongsTo(models.Flavour, { foreignKey: 'flavour_id', as: 'flavour' });
  };

  return Review;
};
