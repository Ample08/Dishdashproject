module.exports = (sequelize, DataTypes) => {
  const Experience = sequelize.define(
    'Experience',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      exp_key: {type: DataTypes.STRING(40), allowNull: false, unique: true},
      brand: DataTypes.STRING(40),
      title: DataTypes.STRING(120),
      location: DataTypes.STRING(120),
      description: DataTypes.TEXT,
      pts: {type: DataTypes.INTEGER, defaultValue: 0},
      value: DataTypes.STRING(40),
      tags: DataTypes.JSON,
      eligible: {type: DataTypes.BOOLEAN, defaultValue: true},
      need_more: DataTypes.INTEGER,
      photo_key: DataTypes.STRING(60),
      sort_order: {type: DataTypes.INTEGER, defaultValue: 0},
    },
    {tableName: 'experiences'}
  );

  return Experience;
};
