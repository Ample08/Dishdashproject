const { sequelize, Order, OrderItem } = require('../../models');
const config = require('../../config');
const { BadRequestError, NotFoundError } = require('../../utils/AppError');

const STAGES = ['placed', 'preparing', 'ready', 'pickedup'];

// Fees mirror the frontend Payment screen (SERVICE_FEE + 5% VAT).
const SERVICE_FEE = 6.0;
const VAT_RATE = 0.05;

const round2 = (n) => Math.round(n * 100) / 100;

/** Derive the live fulfilment stage from how long ago the order was placed. */
const deriveStatus = (placedAt) => {
  const elapsedSec = (Date.now() - new Date(placedAt).getTime()) / 1000;
  const idx = Math.min(
    Math.floor(elapsedSec / config.order.stageSeconds),
    STAGES.length - 1
  );
  return STAGES[Math.max(0, idx)];
};

const serialize = (order) => {
  const json = order.toJSON();
  const status = deriveStatus(json.placed_at);
  return {
    ...json,
    status,
    stageIndex: STAGES.indexOf(status),
    stages: STAGES,
  };
};

const genRef = (id) => `CRV-${String(id).padStart(5, '0')}`;

const createOrder = async (userId, payload) => {
  const {
    brand,
    branch,
    items,
    paymentMethod,
  } = payload;

  if (!brand) throw new BadRequestError('brand is required');
  if (!Array.isArray(items) || items.length === 0) {
    throw new BadRequestError('items must be a non-empty array');
  }

  const lines = items.map((it) => {
    const qty = parseInt(it.qty, 10) || 1;
    const price = Number(it.price) || 0;
    return {
      slug: it.slug || it.id || null,
      name: it.name,
      qty,
      price,
    };
  });

  const subtotal = round2(lines.reduce((s, l) => s + l.qty * l.price, 0));
  const vat = round2(subtotal * VAT_RATE);
  const serviceFee = SERVICE_FEE;
  const total = round2(subtotal + serviceFee + vat);
  const itemCount = lines.reduce((s, l) => s + l.qty, 0);

  const result = await sequelize.transaction(async (t) => {
    const order = await Order.create(
      {
        order_ref: `TMP-${Date.now()}`,
        user_id: userId,
        brand_key: brand,
        branch: branch || null,
        item_count: itemCount,
        subtotal,
        service_fee: serviceFee,
        vat,
        total,
        payment_method: paymentMethod || 'card',
        status: 'placed',
        placed_at: new Date(),
      },
      { transaction: t }
    );

    await order.update({ order_ref: genRef(order.id) }, { transaction: t });

    await OrderItem.bulkCreate(
      lines.map((l) => ({ ...l, order_id: order.id })),
      { transaction: t }
    );

    return order;
  });

  return getOrderByRef(userId, result.order_ref);
};

const getOrderByRef = async (userId, orderRef) => {
  const order = await Order.findOne({
    where: { order_ref: orderRef, user_id: userId },
    include: [{ model: OrderItem, as: 'items' }],
  });
  if (!order) {
    throw new NotFoundError('Order not found');
  }
  return serialize(order);
};

const listOrders = async (userId, pagination) => {
  const { count, rows } = await Order.findAndCountAll({
    where: { user_id: userId },
    include: [{ model: OrderItem, as: 'items' }],
    order: [['placed_at', 'DESC']],
    limit: pagination.limit,
    offset: pagination.offset,
    distinct: true,
  });

  return { total: count, rows: rows.map(serialize) };
};

/** Most recent order that hasn't been picked up yet (the "active" order). */
const getActiveOrder = async (userId) => {
  const orders = await Order.findAll({
    where: { user_id: userId },
    include: [{ model: OrderItem, as: 'items' }],
    order: [['placed_at', 'DESC']],
    limit: 5,
  });

  for (const order of orders) {
    if (deriveStatus(order.placed_at) !== 'pickedup') {
      return serialize(order);
    }
  }
  return null;
};

module.exports = {
  createOrder,
  getOrderByRef,
  listOrders,
  getActiveOrder,
  STAGES,
};
