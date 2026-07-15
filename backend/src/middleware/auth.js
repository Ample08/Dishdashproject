const { verifyToken } = require('../utils/jwtHelper');
const { UnauthorizedError } = require('../utils/AppError');
const { User, Admin } = require('../models');

const extractToken = (req) => {
  if (req.headers['access-token']) {
    return req.headers['access-token'];
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  return null;
};

const authenticateApp = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) {
      throw new UnauthorizedError('Access token required');
    }

    const decoded = verifyToken(token);
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user || !user.is_active) {
      throw new UnauthorizedError('Invalid or inactive user');
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Invalid or expired token'));
    }
    next(err);
  }
};

const authenticateAdmin = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) {
      throw new UnauthorizedError('Admin access token required');
    }

    const decoded = verifyToken(token);
    const admin = await Admin.findByPk(decoded.id, {
      attributes: { exclude: ['password'] },
    });

    if (!admin || !admin.is_active) {
      throw new UnauthorizedError('Invalid or inactive admin');
    }

    req.admin = admin;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Invalid or expired admin token'));
    }
    next(err);
  }
};

module.exports = { authenticateApp, authenticateAdmin };
