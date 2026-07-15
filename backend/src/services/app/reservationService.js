const {Branch, Booking} = require('../../models');
const {NotFoundError, BadRequestError} = require('../../utils/AppError');

const getBranches = async () =>
  Branch.findAll({order: [['sort_order', 'ASC'], ['id', 'ASC']]});

const branchCode = (branchKey) => {
  if (branchKey === 'creek') return 'CRK';
  if (branchKey === 'yas-island') return 'YAS';
  return 'DJM';
};

const createBooking = async (userId, payload) => {
  const {
    restaurant,
    branch,
    branchName,
    dateLabel,
    dateFull,
    timeLabel,
    guests,
    seatingLabel,
    note,
  } = payload;

  const booking = await Booking.create({
    booking_ref: `TMP-${Date.now()}`,
    user_id: userId,
    restaurant: restaurant || 'Karaz',
    branch_key: branch || 'dubai-mall',
    branch_name: branchName || null,
    date_label: dateLabel || null,
    date_full: dateFull || null,
    time_label: timeLabel || null,
    guests: parseInt(guests, 10) || 2,
    seating_label: seatingLabel || null,
    note: note || null,
    status: 'awaiting',
  });

  await booking.update({
    booking_ref: `BR-${branchCode(booking.branch_key)}-${4082 + booking.id}`,
  });

  return booking;
};

const listBookings = async (userId) =>
  Booking.findAll({
    where: {user_id: userId},
    order: [['created_at', 'DESC']],
  });

const getBookingByRef = async (userId, ref) => {
  const booking = await Booking.findOne({
    where: {booking_ref: ref, user_id: userId},
  });
  if (!booking) throw new NotFoundError('Booking not found');
  return booking;
};

const updateBooking = async (userId, ref, patch) => {
  const booking = await getBookingByRef(userId, ref);
  const allowed = {};
  [
    'date_label',
    'date_full',
    'time_label',
    'guests',
    'seating_label',
    'note',
    'status',
  ].forEach((k) => {
    if (patch[k] !== undefined) allowed[k] = patch[k];
  });
  await booking.update(allowed);
  return booking;
};

const cancelBooking = async (userId, ref) =>
  updateBooking(userId, ref, {status: 'cancelled'});

module.exports = {
  getBranches,
  createBooking,
  listBookings,
  getBookingByRef,
  updateBooking,
  cancelBooking,
};
