const { body, param } = require('express-validator');

const appRegisterRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('phone').optional().trim(),
];

const loginRules = [
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const reviewRules = [
  body('score')
    .isInt({ min: 1, max: 5 })
    .withMessage('Score must be between 1 and 5'),
  body('comment').optional().trim(),
];

const flavourCreateRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('description').optional().trim(),
  body('image_url').optional().trim().isURL().withMessage('Valid image URL required'),
  body('is_available').optional().isBoolean(),
];

const flavourUpdateRules = [
  body('name').optional().trim().notEmpty(),
  body('category').optional().trim().notEmpty(),
  body('price').optional().isFloat({ min: 0 }),
  body('description').optional().trim(),
  body('image_url').optional().trim(),
  body('is_available').optional().isBoolean(),
];

const idParamRule = [param('id').isInt({ min: 1 }).withMessage('Valid ID required')];

const requestOtpRules = [
  body('phone').trim().notEmpty().withMessage('Phone is required'),
];

const verifyOtpRules = [
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('code')
    .trim()
    .isLength({ min: 4, max: 6 })
    .withMessage('Valid code is required'),
];

const updateProfileRules = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional({ checkFalsy: true }).trim().isEmail().withMessage('Valid email required'),
  body('phone').optional().trim(),
];

const createOrderRules = [
  body('brand').trim().notEmpty().withMessage('brand is required'),
  body('items').isArray({ min: 1 }).withMessage('items must be a non-empty array'),
  body('items.*.name').trim().notEmpty().withMessage('item name is required'),
  body('items.*.qty').isInt({ min: 1 }).withMessage('item qty must be >= 1'),
  body('items.*.price').isFloat({ min: 0 }).withMessage('item price must be >= 0'),
];

module.exports = {
  appRegisterRules,
  loginRules,
  reviewRules,
  flavourCreateRules,
  flavourUpdateRules,
  idParamRule,
  requestOtpRules,
  verifyOtpRules,
  updateProfileRules,
  createOrderRules,
};
