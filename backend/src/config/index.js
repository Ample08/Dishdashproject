require('dotenv').config();

const port = parseInt(process.env.PORT, 10) || 3000;

module.exports = {
  port,
  nodeEnv: process.env.NODE_ENV || 'development',
  appUrl: process.env.APP_URL || `http://localhost:${port}`,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  apiKey: process.env.JWT_SECRET,
  otp: {
    // Mock mode: always accept this fixed code (no real SMS sent).
    mock: (process.env.OTP_MOCK || 'true') === 'true',
    fixedCode: process.env.OTP_FIXED_CODE || '123456',
    expiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES, 10) || 10,
  },
  order: {
    // Seconds each fulfilment stage lasts, for the live status simulation
    // (placed → preparing → ready → pickedup). Short for demo visibility.
    stageSeconds: parseInt(process.env.ORDER_STAGE_SECONDS, 10) || 20,
  },
};
