const menuService = require('../../services/app/menuService');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../middleware/asyncHandler');

const getBrands = asyncHandler(async (req, res) => {
  const brands = await menuService.getBrands();
  return ApiResponse.success(res, brands, 'Brands fetched');
});

const getBrandByKey = asyncHandler(async (req, res) => {
  const brand = await menuService.getBrandByKey(req.params.key);
  return ApiResponse.success(res, brand, 'Brand fetched');
});

const getMenuItems = asyncHandler(async (req, res) => {
  const items = await menuService.getMenuItems({
    brand: req.query.brand,
    category: req.query.category,
  });
  return ApiResponse.success(res, items, 'Menu fetched');
});

const getMenuItemBySlug = asyncHandler(async (req, res) => {
  const item = await menuService.getMenuItemBySlug(req.params.slug);
  return ApiResponse.success(res, item, 'Menu item fetched');
});

module.exports = { getBrands, getBrandByKey, getMenuItems, getMenuItemBySlug };
