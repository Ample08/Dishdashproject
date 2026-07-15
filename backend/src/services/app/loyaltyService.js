const {
  User,
  Voucher,
  PointHistory,
  Experience,
  LoyaltyBooking,
} = require('../../models');
const {NotFoundError} = require('../../utils/AppError');

const SEED_VOUCHERS = [
  {
    voucher_key: 'v-welcome',
    kind: 'welcome',
    label: 'WELCOME OFFER',
    title: 'Welcome',
    discount: '10%',
    scope: 'DINE-IN ONLY',
    sub: 'First dine-in',
    action: 'Unlock',
    status: 'pending',
    code: 'WELCOME-A3F2K9',
  },
  {
    voucher_key: 'v-celebration',
    kind: 'celebration',
    label: 'CELEBRATION OFFER',
    title: 'Celebration',
    discount: '20%',
    scope: 'PARTIES OF 10+',
    sub: 'Parties of 10+',
    action: 'Generate',
    status: 'available',
    code: 'CELEB-R7K4M2',
  },
];

const SEED_HISTORY = [
  {title: "Chef's Table booked", sub: 'Jade · Dubai Mall · 3 Jun 2026', delta: -800, icon: 'calendar-outline'},
  {title: 'Dine-in at Karaz', sub: 'Dubai Mall · 1 Jun 2026', delta: 42, icon: 'restaurant-outline'},
  {title: 'Pickup order', sub: 'Jade · Abu Dhabi · 28 May 2026', delta: 18, icon: 'bag-handle-outline'},
  {title: 'Friend joined Flavours', sub: 'Sarah · 22 May 2026', delta: 100, icon: 'person-add-outline'},
  {title: 'Dine-in at Jade', sub: 'Abu Dhabi · 17 May 2026', delta: 24, icon: 'restaurant-outline'},
  {title: 'Pickup order', sub: 'Karaz · JBR · 8 May 2026', delta: 12, icon: 'bag-handle-outline'},
  {title: 'Welcome bonus', sub: 'Joined Flavours · 1 May 2026', delta: 50, icon: 'gift-outline'},
];

/** Voucher rows expose `id` == voucher_key so the app's stable ids line up. */
const serializeVoucher = (v) => {
  const json = v.toJSON();
  return {...json, id: json.voucher_key};
};

const getSummary = async (userId) => {
  const user = await User.findByPk(userId, {attributes: ['id', 'loyalty_points']});
  if (!user) throw new NotFoundError('User not found');
  return {points: user.loyalty_points};
};

const getVouchers = async (userId) => {
  let vouchers = await Voucher.findAll({
    where: {user_id: userId},
    order: [['id', 'ASC']],
  });

  if (vouchers.length === 0) {
    await Voucher.bulkCreate(
      SEED_VOUCHERS.map((v) => ({...v, user_id: userId}))
    );
    vouchers = await Voucher.findAll({
      where: {user_id: userId},
      order: [['id', 'ASC']],
    });
  }

  return vouchers.map(serializeVoucher);
};

const findVoucher = async (userId, key) => {
  await getVouchers(userId); // ensure seeded
  const voucher = await Voucher.findOne({
    where: {user_id: userId, voucher_key: key},
  });
  if (!voucher) throw new NotFoundError('Voucher not found');
  return voucher;
};

const claimVoucher = async (userId, key) => {
  const voucher = await findVoucher(userId, key);
  await voucher.update({status: 'claimed'});
  return serializeVoucher(voucher);
};

const redeemVoucher = async (userId, key) => {
  const voucher = await findVoucher(userId, key);
  await voucher.update({status: 'used'});
  return serializeVoucher(voucher);
};

const generateCelebration = async (userId, guests) => {
  const voucher = await findVoucher(userId, 'v-celebration');
  await voucher.update({
    status: 'claimed',
    guests: parseInt(guests, 10) || undefined,
  });
  return serializeVoucher(voucher);
};

const getPointHistory = async (userId) => {
  let rows = await PointHistory.findAll({
    where: {user_id: userId},
    order: [['id', 'ASC']],
  });

  if (rows.length === 0) {
    await PointHistory.bulkCreate(
      SEED_HISTORY.map((h) => ({...h, user_id: userId}))
    );
    rows = await PointHistory.findAll({
      where: {user_id: userId},
      order: [['id', 'ASC']],
    });
  }

  // Stable string ids (p1, p2, …) matching the frontend seed shape.
  return rows.map((r, i) => ({...r.toJSON(), id: `p${i + 1}`}));
};

const getExperiences = async () =>
  Experience.findAll({order: [['sort_order', 'ASC'], ['id', 'ASC']]});

const SEED_LOYALTY_BOOKINGS = [
  {exp_key: 'x-chefs-table', brand: 'Jade', title: "Chef's Table", date_label: 'Sat 6 Jun 2026 · 7:30 PM', location: 'Dubai Mall', in_days: 4},
  {exp_key: null, brand: 'Karaz', title: 'Sunday Brunch Reserve', date_label: 'Sun 14 Jun 2026 · 12:00 PM', location: 'JBR', in_days: 12},
  {exp_key: 'x-private-dining', brand: 'Jade', title: 'Private Dining Room', date_label: 'Sat 27 Jun 2026 · 8:00 PM', location: 'Dubai Mall', in_days: 25},
];

const serializeLoyaltyBooking = (b) => {
  const json = b.toJSON();
  return {
    id: json.booking_key,
    brand: json.brand,
    title: json.title,
    dateLabel: json.date_label,
    location: json.location,
    inDays: json.in_days,
    past: json.past,
  };
};

const listLoyaltyBookings = async (userId) => {
  let rows = await LoyaltyBooking.findAll({
    where: {user_id: userId},
    order: [['in_days', 'ASC'], ['id', 'ASC']],
  });

  if (rows.length === 0) {
    for (const seed of SEED_LOYALTY_BOOKINGS) {
      const row = await LoyaltyBooking.create({
        ...seed,
        user_id: userId,
        booking_key: `TMP-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
      });
      await row.update({booking_key: `lb-${row.id}`});
    }
    rows = await LoyaltyBooking.findAll({
      where: {user_id: userId},
      order: [['in_days', 'ASC'], ['id', 'ASC']],
    });
  }

  return rows.map(serializeLoyaltyBooking);
};

/** Book an experience with points: creates a booking, deducts pts, logs it. */
const bookExperience = async (userId, expKey, payload = {}) => {
  const experience = await Experience.findOne({where: {exp_key: expKey}});
  if (!experience) throw new NotFoundError('Experience not found');

  await listLoyaltyBookings(userId); // ensure seed exists first

  const row = await LoyaltyBooking.create({
    booking_key: `TMP-${Date.now()}`,
    user_id: userId,
    exp_key: experience.exp_key,
    brand: experience.brand,
    title: experience.title,
    date_label: payload.dateLabel || 'Upcoming',
    location: experience.location,
    in_days: payload.inDays != null ? payload.inDays : 7,
    past: false,
  });
  await row.update({booking_key: `lb-${row.id}`});

  // Deduct points and record the spend in point history.
  const user = await User.findByPk(userId);
  if (user) {
    const newPoints = Math.max(0, user.loyalty_points - experience.pts);
    await user.update({loyalty_points: newPoints});
    await PointHistory.create({
      user_id: userId,
      title: `${experience.title} booked`,
      sub: `${experience.location}`,
      delta: -experience.pts,
      icon: 'calendar-outline',
    });
  }

  return serializeLoyaltyBooking(row);
};

module.exports = {
  getSummary,
  getVouchers,
  claimVoucher,
  redeemVoucher,
  generateCelebration,
  getPointHistory,
  getExperiences,
  listLoyaltyBookings,
  bookExperience,
};
