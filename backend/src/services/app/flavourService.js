const { Flavour, Review, User } = require('../../models');
const { buildPaginationMeta } = require('../../middleware/pagination');
const { NotFoundError, ConflictError } = require('../../utils/AppError');
const { generatePaginatedPdf } = require('../../utils/pdfGenerator');

const getFlavours = async (pagination, filters = {}) => {
  const where = { is_available: true };

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.search) {
    const { Op } = require('sequelize');
    where.name = { [Op.like]: `%${filters.search}%` };
  }

  const { count, rows } = await Flavour.findAndCountAll({
    where,
    limit: pagination.limit,
    offset: pagination.offset,
    order: [[pagination.sortBy, pagination.sortOrder]],
  });

  return {
    flavours: rows,
    pagination: buildPaginationMeta(count, pagination),
  };
};

const getFlavourById = async (id) => {
  const flavour = await Flavour.findOne({
    where: { id, is_available: true },
    include: [
      {
        model: Review,
        as: 'reviews',
        limit: 5,
        order: [['created_at', 'DESC']],
        include: [{ model: User, as: 'user', attributes: ['id', 'name'] }],
      },
    ],
  });

  if (!flavour) {
    throw new NotFoundError('Flavour not found');
  }

  return flavour;
};

const addReview = async (userId, flavourId, { score, comment }) => {
  const flavour = await Flavour.findByPk(flavourId);
  if (!flavour || !flavour.is_available) {
    throw new NotFoundError('Flavour not found');
  }

  const existing = await Review.findOne({
    where: { user_id: userId, flavour_id: flavourId },
  });

  if (existing) {
    throw new ConflictError('You have already reviewed this flavour');
  }

  const review = await Review.create({
    user_id: userId,
    flavour_id: flavourId,
    score,
    comment,
  });

  await updateFlavourScore(flavourId);
  return review;
};

const updateFlavourScore = async (flavourId) => {
  const { sequelize } = require('../../models');
  const result = await Review.findOne({
    where: { flavour_id: flavourId },
    attributes: [
      [sequelize.fn('AVG', sequelize.col('score')), 'avgScore'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
    ],
    raw: true,
  });

  await Flavour.update(
    {
      average_score: parseFloat(result.avgScore || 0).toFixed(2),
      total_reviews: parseInt(result.total, 10) || 0,
    },
    { where: { id: flavourId } }
  );
};

const exportFlavoursPdf = async (pagination, filters = {}) => {
  const where = { is_available: true };
  if (filters.category) where.category = filters.category;

  const rows = await Flavour.findAll({
    where,
    limit: pagination.limit,
    offset: pagination.offset,
    order: [[pagination.sortBy, pagination.sortOrder]],
  });

  const pdfData = rows.map((f) => ({
    id: f.id,
    name: f.name,
    category: f.category,
    price: f.price,
    score: f.average_score,
    reviews: f.total_reviews,
    date: new Date(f.created_at).toLocaleDateString(),
  }));

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'category', label: 'Category' },
    { key: 'price', label: 'Price' },
    { key: 'score', label: 'Score' },
    { key: 'reviews', label: 'Reviews' },
    { key: 'date', label: 'Date' },
  ];

  return generatePaginatedPdf(pdfData, columns, 'DishDash Flavours Report');
};

module.exports = {
  getFlavours,
  getFlavourById,
  addReview,
  exportFlavoursPdf,
};
