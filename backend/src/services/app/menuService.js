const { Brand, MenuItem } = require('../../models');
const { NotFoundError } = require('../../utils/AppError');

const itemOrder = [
  ['sort_order', 'ASC'],
  ['id', 'ASC'],
];

const getBrands = async () => {
  return Brand.findAll({ order: [['sort_order', 'ASC'], ['id', 'ASC']] });
};

const getBrandByKey = async (brandKey) => {
  const brand = await Brand.findOne({ where: { brand_key: brandKey } });
  if (!brand) {
    throw new NotFoundError('Brand not found');
  }
  return brand;
};

/**
 * List menu items, optionally filtered by brand and category.
 * `category === 'Most Ordered'` maps to popular items.
 */
const getMenuItems = async ({ brand, category } = {}) => {
  const where = {};
  if (brand) where.brand_key = brand;

  if (category && category !== 'Most Ordered') {
    where.category = category;
  }

  let items = await MenuItem.findAll({ where, order: itemOrder });

  if (category === 'Most Ordered') {
    items = items.filter((i) => i.popular);
  }

  return items;
};

const getMenuItemBySlug = async (slug) => {
  const item = await MenuItem.findOne({ where: { slug } });
  if (!item) {
    throw new NotFoundError('Menu item not found');
  }
  return item;
};

module.exports = { getBrands, getBrandByKey, getMenuItems, getMenuItemBySlug };
