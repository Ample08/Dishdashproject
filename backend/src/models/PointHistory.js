module.exports = (sequelize, DataTypes) => {
  const PointHistory = sequelize.define(
    'PointHistory',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {type: DataTypes.INTEGER.UNSIGNED, allowNull: false},
      title: DataTypes.STRING(120),
      sub: DataTypes.STRING(160),
      delta: {type: DataTypes.INTEGER, defaultValue: 0},
      icon: DataTypes.STRING(40),
    },
    {tableName: 'point_history'}
  );

  PointHistory.associate = (models) => {
    PointHistory.belongsTo(models.User, {foreignKey: 'user_id', as: 'user'});
  };

  return PointHistory;
};
