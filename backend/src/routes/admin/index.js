const express = require('express');
const authController = require('../../controllers/admin/authController');
const flavourController = require('../../controllers/admin/flavourController');
const userController = require('../../controllers/admin/userController');
const { authenticateAdmin } = require('../../middleware/auth');
const { verifyApiKey } = require('../../middleware/apiKey');
const { paginate } = require('../../middleware/pagination');
const validate = require('../../middleware/validate');
const {
  loginRules,
  flavourCreateRules,
  flavourUpdateRules,
  idParamRule,
} = require('../../validators/authValidator');

const router = express.Router();

router.use(verifyApiKey);

router.post('/login', loginRules, validate, authController.login);

router.use(authenticateAdmin);

router.get('/profile', authController.getProfile);
router.get('/dashboard', flavourController.getDashboardStats);

router.get('/flavours', paginate, flavourController.getAllFlavours);
router.post('/flavours', flavourCreateRules, validate, flavourController.createFlavour);
router.put('/flavours/:id', idParamRule, flavourUpdateRules, validate, flavourController.updateFlavour);
router.delete('/flavours/:id', idParamRule, validate, flavourController.deleteFlavour);
router.get('/flavours/export/pdf', paginate, flavourController.downloadFlavoursPdf);

router.get('/reviews', paginate, flavourController.getAllReviews);
router.get('/reviews/export/pdf', paginate, flavourController.downloadReviewsPdf);

router.get('/users', paginate, userController.getAllUsers);
router.patch('/users/:id/toggle-status', idParamRule, validate, userController.toggleUserStatus);

module.exports = router;
