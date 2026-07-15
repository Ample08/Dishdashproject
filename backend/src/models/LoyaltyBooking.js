module.exports = (sequelize, DataTypes) => {
  const LoyaltyBooking = sequelize.define(
    'LoyaltyBooking',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      booking_key: {type: DataTypes.STRING(40), allowNull: false, unique: true},
      user_id: {type: DataTypes.INTEGER.UNSIGNED, allowNull: false},
      exp_key: DataTypes.STRING(40),
      brand: DataTypes.STRING(40),
      title: DataTypes.STRING(120),
      date_label: DataTypes.STRING(60),
      location: DataTypes.STRING(120),
      in_days: {type: DataTypes.INTEGER, defaultValue: 0},
      past: {type: DataTypes.BOOLEAN, defaultValue: false},
    },
    {tableName: 'loyalty_bookings'}
  );

  LoyaltyBooking.associate = (models) => {
    LoyaltyBooking.belongsTo(models.User, {foreignKey: 'user_id', as: 'user'});
  };

  return LoyaltyBooking;
};
