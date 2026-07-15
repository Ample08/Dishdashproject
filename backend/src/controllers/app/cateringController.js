const cateringService = require('../../services/app/cateringService');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../middleware/asyncHandler');

const createInquiry = asyncHandler(async (req, res) => {
  const userId = req.user ? req.user.id : null;
  const inquiry = await cateringService.createInquiry(userId, req.body);
  return ApiResponse.created(res, inquiry, 'Inquiry submitted');
});

const listInquiries = asyncHandler(async (req, res) => {
  const inquiries = await cateringService.listInquiries(req.user.id);
  return ApiResponse.success(res, inquiries, 'Inquiries fetched');
});

const getInquiry = asyncHandler(async (req, res) => {
  const inquiry = await cateringService.getInquiryByRef(
    req.user.id,
    req.params.ref
  );
  return ApiResponse.success(res, inquiry, 'Inquiry fetched');
});

module.exports = {createInquiry, listInquiries, getInquiry};
