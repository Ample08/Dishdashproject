const orderService = require('../../services/app/orderService');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../middleware/asyncHandler');
const { buildPaginationMeta } = require('../../middleware/pagination');

const createOrder = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.user.id, req.body);
  return ApiResponse.created(res, order, 'Order placed');
});

const listOrders = asyncHandler(async (req, res) => {
  const { total, rows } = await orderService.listOrders(
    req.user.id,
    req.pagination
  );
  const meta = buildPaginationMeta(total, req.pagination);
  return ApiResponse.paginated(res, rows, meta, 'Orders fetched');
});

const getActiveOrder = asyncHandler(async (req, res) => {
  const order = await orderService.getActiveOrder(req.user.id);
  return ApiResponse.success(res, order, 'Active order fetched');
});

const getOrderByRef = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderByRef(req.user.id, req.params.ref);
  return ApiResponse.success(res, order, 'Order fetched');
});

module.exports = { createOrder, listOrders, getActiveOrder, getOrderByRef };
