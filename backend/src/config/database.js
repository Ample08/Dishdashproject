const { Sequelize } = require('sequelize');
const sequelizeConfig = require('./sequelize.config');

const env = process.env.NODE_ENV || 'development';
const config = sequelizeConfig[env];

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: config.logging,
    define: config.define,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

const connectDatabase = async () => {
  await sequelize.authenticate();
  console.log('MySQL database connected successfully.');
};

module.exports = { sequelize, connectDatabase };
