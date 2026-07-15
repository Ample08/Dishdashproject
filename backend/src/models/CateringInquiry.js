module.exports = (sequelize, DataTypes) => {
  const CateringInquiry = sequelize.define(
    'CateringInquiry',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      inquiry_ref: {type: DataTypes.STRING(24), allowNull: false, unique: true},
      user_id: {type: DataTypes.INTEGER.UNSIGNED, allowNull: true},
      event_type: DataTypes.STRING(40),
      title: DataTypes.STRING(160),
      guests: {type: DataTypes.INTEGER, defaultValue: 0},
      date_label: DataTypes.STRING(40),
      location: DataTypes.STRING(120),
      budget: DataTypes.STRING(60),
      requirements: DataTypes.TEXT,
      name: DataTypes.STRING(120),
      email: DataTypes.STRING(150),
      phone: DataTypes.STRING(40),
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'awaiting',
      },
    },
    {tableName: 'catering_inquiries'}
  );

  return CateringInquiry;
};
