const authService = require('../../services/admin/authService');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../middleware/asyncHandler');

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  return ApiResponse.success(res, result, 'Admin login successful');
});

const getProfile = asyncHandler(async (req, res) => {
  const admin = await authService.getProfile(req.admin.id);
  return ApiResponse.success(res, admin, 'Admin profile fetched');
});

module.exports = { login, getProfile };
