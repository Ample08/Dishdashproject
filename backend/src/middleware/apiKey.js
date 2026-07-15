const config = require('../config');
const { UnauthorizedError } = require('../utils/AppError');

const verifyApiKey = (req, res, next) => {
  const apiKey = req.headers['api-key'];
  if (!apiKey || apiKey !== config.apiKey) {
    return next(new UnauthorizedError('Invalid or missing api-key header'));
  }
  next();
};

module.exports = { verifyApiKey };
