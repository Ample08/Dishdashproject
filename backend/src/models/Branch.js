module.exports = (sequelize, DataTypes) => {
  const Branch = sequelize.define(
    'Branch',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      branch_key: {type: DataTypes.STRING(40), allowNull: false, unique: true},
      name: {type: DataTypes.STRING(80), allowNull: false},
      area: DataTypes.STRING(160),
      rating: {type: DataTypes.DECIMAL(2, 1), defaultValue: 0},
      rating_count: DataTypes.STRING(20),
      tags: DataTypes.JSON,
      highlight: DataTypes.STRING(160),
      most_loved: DataTypes.STRING(80),
      facts: DataTypes.JSON,
      photo_key: DataTypes.STRING(60),
      photos: DataTypes.JSON,
      sort_order: {type: DataTypes.INTEGER, defaultValue: 0},
    },
    {tableName: 'branches'}
  );

  return Branch;
};
