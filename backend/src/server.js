/**
 * Local development & PM2 entry point (npm start).
 * Production on cPanel Passenger uses the root app.js instead.
 */
require('dotenv').config();

const createApp = require('./app');
const { connectDatabase } = require('./config/database');
const config = require('./config');

const startServer = async () => {
  try {
    if (!process.env.JWT_SECRET) {
      console.error('Error: JWT_SECRET must be set in .env file');
      process.exit(1);
    }

    await connectDatabase();

    const app = createApp();
    const server = app.listen(config.port, () => {
      console.log(`Server running on http://localhost:${config.port}`);
      console.log(`App API:   http://localhost:${config.port}/api/app`);
      console.log(`Admin API: http://localhost:${config.port}/api/admin`);
      console.log(`API Docs:  http://localhost:${config.port}/api/docs`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\nPort ${config.port} already in use!`);
        console.error('Fix: Purane server ko band karein (Ctrl+C) ya ye command chalayein:\n');
        console.error(`  netstat -ano | findstr :${config.port}`);
        console.error('  taskkill /PID <PID> /F\n');
        console.error('Ya .env me PORT=3001 set karke dubara npm run dev chalayein.\n');
        process.exit(1);
      }
      console.error('Server error:', err.message);
      process.exit(1);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
