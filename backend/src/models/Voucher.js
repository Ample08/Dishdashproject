module.exports = (sequelize, DataTypes) => {
  const Voucher = sequelize.define(
    'Voucher',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {type: DataTypes.INTEGER.UNSIGNED, allowNull: false},
      voucher_key: DataTypes.STRING(40),
      kind: DataTypes.STRING(20),
      label: DataTypes.STRING(60),
      title: DataTypes.STRING(60),
      discount: DataTypes.STRING(20),
      scope: DataTypes.STRING(60),
      sub: DataTypes.STRING(80),
      action: DataTypes.STRING(20),
      status: {type: DataTypes.STRING(20), defaultValue: 'available'},
      code: DataTypes.STRING(40),
      guests: DataTypes.INTEGER,
    },
    {tableName: 'vouchers'}
  );

  Voucher.associate = (models) => {
    Voucher.belongsTo(models.User, {foreignKey: 'user_id', as: 'user'});
  };

  return Voucher;
};
