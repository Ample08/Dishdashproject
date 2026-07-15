const flavourService = require('../../services/admin/flavourService');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../middleware/asyncHandler');

const getAllFlavours = asyncHandler(async (req, res) => {
  const result = await flavourService.getAllFlavours(req.pagination, req.query);
  return ApiResponse.paginated(res, result.flavours, result.pagination, 'Flavours fetched');
});

const createFlavour = asyncHandler(async (req, res) => {
  const flavour = await flavourService.createFlavour(req.body);
  return ApiResponse.created(res, flavour, 'Flavour created');
});

const updateFlavour = asyncHandler(async (req, res) => {
  const flavour = await flavourService.updateFlavour(req.params.id, req.body);
  return ApiResponse.success(res, flavour, 'Flavour updated');
});

const deleteFlavour = asyncHandler(async (req, res) => {
  const result = await flavourService.deleteFlavour(req.params.id);
  return ApiResponse.success(res, result, 'Flavour deleted');
});

const getAllReviews = asyncHandler(async (req, res) => {
  const result = await flavourService.getAllReviews(req.pagination);
  return ApiResponse.paginated(res, result.reviews, result.pagination, 'Reviews fetched');
});

const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await flavourService.getDashboardStats();
  return ApiResponse.success(res, stats, 'Dashboard stats fetched');
});

const downloadFlavoursPdf = asyncHandler(async (req, res) => {
  const pdfBuffer = await flavourService.exportFlavoursPdf(req.pagination, req.query);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=admin-flavours-report.pdf');
  return res.status(200).send(pdfBuffer);
});

const downloadReviewsPdf = asyncHandler(async (req, res) => {
  const pdfBuffer = await flavourService.exportReviewsPdf(req.pagination);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=admin-reviews-report.pdf');
  return res.status(200).send(pdfBuffer);
});

module.exports = {
  getAllFlavours,
  createFlavour,
  updateFlavour,
  deleteFlavour,
  getAllReviews,
  getDashboardStats,
  downloadFlavoursPdf,
  downloadReviewsPdf,
};
