const flavourService = require('../../services/app/flavourService');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../middleware/asyncHandler');

const getFlavours = asyncHandler(async (req, res) => {
  const result = await flavourService.getFlavours(req.pagination, req.query);
  return ApiResponse.paginated(res, result.flavours, result.pagination, 'Flavours fetched');
});

const getFlavourById = asyncHandler(async (req, res) => {
  const flavour = await flavourService.getFlavourById(req.params.id);
  return ApiResponse.success(res, flavour, 'Flavour details fetched');
});

const addReview = asyncHandler(async (req, res) => {
  const review = await flavourService.addReview(req.user.id, req.params.id, req.body);
  return ApiResponse.created(res, review, 'Review submitted successfully');
});

const downloadFlavoursPdf = asyncHandler(async (req, res) => {
  const pdfBuffer = await flavourService.exportFlavoursPdf(req.pagination, req.query);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=flavours-report.pdf');
  return res.status(200).send(pdfBuffer);
});

module.exports = { getFlavours, getFlavourById, addReview, downloadFlavoursPdf };
