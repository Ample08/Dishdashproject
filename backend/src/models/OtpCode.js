module.exports = (sequelize, DataTypes) => {
  const OtpCode = sequelize.define(
    'OtpCode',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING(6),
        allowNull: false,
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      consumed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    { tableName: 'otp_codes' }
  );

  return OtpCode;
};
