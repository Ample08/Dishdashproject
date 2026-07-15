const { validationResult } = require('express-validator');
const { BadRequestError } = require('../utils/AppError');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({
      field: e.path,
      message: e.msg,
    }));
    return next(new BadRequestError('Validation failed', formatted));
  }
  next();
};

module.exports = validate;
