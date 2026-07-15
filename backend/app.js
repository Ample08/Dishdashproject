/**
 * cPanel Passenger / Application Manager entry point.
 * Passenger loads this file and serves the exported Express app (no app.listen).
 * Local development uses src/server.js instead.
 */
require('dotenv').config();

const createApp = require('./src/app');
const { connectDatabase } = require('./src/config/database');

const app = createApp();

connectDatabase()
  .then(() => console.log("Database connected"))
  .catch(err => console.error(err));

module.exports = app;
