module.exports = (sequelize, DataTypes) => {
  const Booking = sequelize.define(
    'Booking',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      booking_ref: {type: DataTypes.STRING(24), allowNull: false, unique: true},
      user_id: {type: DataTypes.INTEGER.UNSIGNED, allowNull: false},
      restaurant: DataTypes.STRING(40),
      branch_key: DataTypes.STRING(40),
      branch_name: DataTypes.STRING(80),
      date_label: DataTypes.STRING(40),
      date_full: DataTypes.STRING(60),
      time_label: DataTypes.STRING(20),
      guests: {type: DataTypes.INTEGER, defaultValue: 2},
      seating_label: DataTypes.STRING(80),
      note: DataTypes.TEXT,
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'awaiting',
      },
    },
    {tableName: 'bookings'}
  );

  Booking.associate = (models) => {
    Booking.belongsTo(models.User, {foreignKey: 'user_id', as: 'user'});
  };

  return Booking;
};
