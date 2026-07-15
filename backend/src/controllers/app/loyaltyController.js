const loyaltyService = require('../../services/app/loyaltyService');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../middleware/asyncHandler');

const getSummary = asyncHandler(async (req, res) => {
  const summary = await loyaltyService.getSummary(req.user.id);
  return ApiResponse.success(res, summary, 'Loyalty summary');
});

const getVouchers = asyncHandler(async (req, res) => {
  const vouchers = await loyaltyService.getVouchers(req.user.id);
  return ApiResponse.success(res, vouchers, 'Vouchers fetched');
});

const claimVoucher = asyncHandler(async (req, res) => {
  const voucher = await loyaltyService.claimVoucher(req.user.id, req.params.key);
  return ApiResponse.success(res, voucher, 'Voucher claimed');
});

const redeemVoucher = asyncHandler(async (req, res) => {
  const voucher = await loyaltyService.redeemVoucher(req.user.id, req.params.key);
  return ApiResponse.success(res, voucher, 'Voucher redeemed');
});

const generateCelebration = asyncHandler(async (req, res) => {
  const voucher = await loyaltyService.generateCelebration(
    req.user.id,
    req.body.guests
  );
  return ApiResponse.success(res, voucher, 'Celebration code generated');
});

const getPointHistory = asyncHandler(async (req, res) => {
  const history = await loyaltyService.getPointHistory(req.user.id);
  return ApiResponse.success(res, history, 'Point history fetched');
});

const getExperiences = asyncHandler(async (req, res) => {
  const experiences = await loyaltyService.getExperiences();
  return ApiResponse.success(res, experiences, 'Experiences fetched');
});

const getLoyaltyBookings = asyncHandler(async (req, res) => {
  const bookings = await loyaltyService.listLoyaltyBookings(req.user.id);
  return ApiResponse.success(res, bookings, 'Loyalty bookings fetched');
});

const bookExperience = asyncHandler(async (req, res) => {
  const booking = await loyaltyService.bookExperience(
    req.user.id,
    req.params.key,
    req.body
  );
  return ApiResponse.created(res, booking, 'Experience booked');
});

module.exports = {
  getSummary,
  getVouchers,
  claimVoucher,
  redeemVoucher,
  generateCelebration,
  getPointHistory,
  getExperiences,
  getLoyaltyBookings,
  bookExperience,
};
