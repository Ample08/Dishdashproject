const reservationService = require('../../services/app/reservationService');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../middleware/asyncHandler');

const getBranches = asyncHandler(async (req, res) => {
  const branches = await reservationService.getBranches();
  return ApiResponse.success(res, branches, 'Branches fetched');
});

const createBooking = asyncHandler(async (req, res) => {
  const booking = await reservationService.createBooking(req.user.id, req.body);
  return ApiResponse.created(res, booking, 'Booking created');
});

const listBookings = asyncHandler(async (req, res) => {
  const bookings = await reservationService.listBookings(req.user.id);
  return ApiResponse.success(res, bookings, 'Bookings fetched');
});

const getBooking = asyncHandler(async (req, res) => {
  const booking = await reservationService.getBookingByRef(
    req.user.id,
    req.params.ref
  );
  return ApiResponse.success(res, booking, 'Booking fetched');
});

const updateBooking = asyncHandler(async (req, res) => {
  const booking = await reservationService.updateBooking(
    req.user.id,
    req.params.ref,
    req.body
  );
  return ApiResponse.success(res, booking, 'Booking updated');
});

const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await reservationService.cancelBooking(
    req.user.id,
    req.params.ref
  );
  return ApiResponse.success(res, booking, 'Booking cancelled');
});

module.exports = {
  getBranches,
  createBooking,
  listBookings,
  getBooking,
  updateBooking,
  cancelBooking,
};
