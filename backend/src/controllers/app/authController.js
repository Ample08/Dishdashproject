const authService = require('../../services/app/authService');
const otpAuthService = require('../../services/app/otpAuthService');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../middleware/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  return ApiResponse.created(res, result, 'Registration successful');
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  return ApiResponse.success(res, result, 'Login successful');
});

const requestOtp = asyncHandler(async (req, res) => {
  const result = await otpAuthService.requestOtp(req.body);
  return ApiResponse.success(res, result, 'OTP sent');
});

const verifyOtp = asyncHandler(async (req, res) => {
  const result = await otpAuthService.verifyOtp(req.body);
  return ApiResponse.success(res, result, 'OTP verified');
});

const getProfile = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user.id);
  return ApiResponse.success(res, user, 'Profile fetched');
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user.id, req.body);
  return ApiResponse.success(res, user, 'Profile updated');
});

module.exports = {
  register,
  login,
  requestOtp,
  verifyOtp,
  getProfile,
  updateProfile,
};
