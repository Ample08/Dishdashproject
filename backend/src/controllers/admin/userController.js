const userService = require('../../services/admin/userService');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../middleware/asyncHandler');

const getAllUsers = asyncHandler(async (req, res) => {
  const result = await userService.getAllUsers(req.pagination);
  return ApiResponse.paginated(res, result.users, result.pagination, 'Users fetched');
});

const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await userService.toggleUserStatus(req.params.id);
  return ApiResponse.success(res, user, 'User status updated');
});

module.exports = { getAllUsers, toggleUserStatus };
