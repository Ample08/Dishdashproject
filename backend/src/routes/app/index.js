const express = require('express');
const authController = require('../../controllers/app/authController');
const flavourController = require('../../controllers/app/flavourController');
const menuController = require('../../controllers/app/menuController');
const orderController = require('../../controllers/app/orderController');
const reservationController = require('../../controllers/app/reservationController');
const cateringController = require('../../controllers/app/cateringController');
const loyaltyController = require('../../controllers/app/loyaltyController');
const { authenticateApp } = require('../../middleware/auth');
const { verifyApiKey } = require('../../middleware/apiKey');
const { paginate } = require('../../middleware/pagination');
const validate = require('../../middleware/validate');
const {
  appRegisterRules,
  loginRules,
  reviewRules,
  idParamRule,
  requestOtpRules,
  verifyOtpRules,
  updateProfileRules,
  createOrderRules,
} = require('../../validators/authValidator');

const router = express.Router();

router.use(verifyApiKey);

// --- Auth ---
router.post('/register', appRegisterRules, validate, authController.register);
router.post('/login', loginRules, validate, authController.login);
router.post('/auth/request-otp', requestOtpRules, validate, authController.requestOtp);
router.post('/auth/verify-otp', verifyOtpRules, validate, authController.verifyOtp);

router.get('/profile', authenticateApp, authController.getProfile);
router.put('/profile', authenticateApp, updateProfileRules, validate, authController.updateProfile);

// --- Brands & Menu (public catalog) ---
router.get('/brands', menuController.getBrands);
router.get('/brands/:key', menuController.getBrandByKey);
router.get('/menu', menuController.getMenuItems);
router.get('/menu/:slug', menuController.getMenuItemBySlug);

// --- Orders (require app auth) ---
router.post('/orders', authenticateApp, createOrderRules, validate, orderController.createOrder);
router.get('/orders', authenticateApp, paginate, orderController.listOrders);
router.get('/orders/active', authenticateApp, orderController.getActiveOrder);
router.get('/orders/:ref', authenticateApp, orderController.getOrderByRef);

// --- Reservations ---
router.get('/branches', reservationController.getBranches);
router.post('/bookings', authenticateApp, reservationController.createBooking);
router.get('/bookings', authenticateApp, reservationController.listBookings);
router.get('/bookings/:ref', authenticateApp, reservationController.getBooking);
router.patch('/bookings/:ref', authenticateApp, reservationController.updateBooking);
router.post('/bookings/:ref/cancel', authenticateApp, reservationController.cancelBooking);

// --- Catering ---
router.post('/catering/inquiries', authenticateApp, cateringController.createInquiry);
router.get('/catering/inquiries', authenticateApp, cateringController.listInquiries);
router.get('/catering/inquiries/:ref', authenticateApp, cateringController.getInquiry);

// --- Loyalty ---
router.get('/loyalty/summary', authenticateApp, loyaltyController.getSummary);
router.get('/loyalty/experiences', loyaltyController.getExperiences);
router.get('/loyalty/vouchers', authenticateApp, loyaltyController.getVouchers);
router.post('/loyalty/vouchers/:key/claim', authenticateApp, loyaltyController.claimVoucher);
router.post('/loyalty/vouchers/:key/redeem', authenticateApp, loyaltyController.redeemVoucher);
router.post('/loyalty/celebration', authenticateApp, loyaltyController.generateCelebration);
router.get('/loyalty/point-history', authenticateApp, loyaltyController.getPointHistory);
router.get('/loyalty/bookings', authenticateApp, loyaltyController.getLoyaltyBookings);
router.post('/loyalty/experiences/:key/book', authenticateApp, loyaltyController.bookExperience);

// --- Flavours (legacy demo catalog) ---
router.get('/flavours', paginate, flavourController.getFlavours);
router.get('/flavours/export/pdf', paginate, flavourController.downloadFlavoursPdf);
router.get('/flavours/:id', idParamRule, validate, flavourController.getFlavourById);
router.post(
  '/flavours/:id/review',
  authenticateApp,
  idParamRule,
  reviewRules,
  validate,
  flavourController.addReview
);

module.exports = router;
