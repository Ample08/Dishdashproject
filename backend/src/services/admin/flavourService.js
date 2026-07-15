const { Flavour, Review, User } = require('../../models');
const { buildPaginationMeta } = require('../../middleware/pagination');
const { NotFoundError } = require('../../utils/AppError');
const { generatePaginatedPdf } = require('../../utils/pdfGenerator');

const getAllFlavours = async (pagination, filters = {}) => {
  const where = {};

  if (filters.category) where.category = filters.category;
  if (filters.is_available !== undefined) {
    where.is_available = filters.is_available === 'true' || filters.is_available === true;
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

const createFlavour = async (data) => {
  return Flavour.create(data);
};

const updateFlavour = async (id, data) => {
  const flavour = await Flavour.findByPk(id);
  if (!flavour) {
    throw new NotFoundError('Flavour not found');
  }

  await flavour.update(data);
  return flavour;
};

const deleteFlavour = async (id) => {
  const flavour = await Flavour.findByPk(id);
  if (!flavour) {
    throw new NotFoundError('Flavour not found');
  }

  await flavour.destroy();
  return { message: 'Flavour deleted successfully' };
};

const getAllReviews = async (pagination) => {
  const { count, rows } = await Review.findAndCountAll({
    limit: pagination.limit,
    offset: pagination.offset,
    order: [[pagination.sortBy, pagination.sortOrder]],
    include: [
      { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
      { model: Flavour, as: 'flavour', attributes: ['id', 'name'] },
    ],
  });

  return {
    reviews: rows,
    pagination: buildPaginationMeta(count, pagination),
  };
};

const getDashboardStats = async () => {
  const totalFlavours = await Flavour.count();
  const totalReviews = await Review.count();
  const totalUsers = await User.count();
  const avgScore = await Review.findOne({
    attributes: [[require('../../models').sequelize.fn('AVG', require('../../models').sequelize.col('score')), 'avg']],
    raw: true,
  });

  return {
    totalFlavours,
    totalReviews,
    totalUsers,
    averageScore: parseFloat(avgScore?.avg || 0).toFixed(2),
  };
};

const exportFlavoursPdf = async (pagination, filters = {}) => {
  const where = {};
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
    available: f.is_available ? 'Yes' : 'No',
    score: f.average_score,
    reviews: f.total_reviews,
    created: new Date(f.created_at).toLocaleDateString(),
  }));

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'category', label: 'Category' },
    { key: 'price', label: 'Price' },
    { key: 'available', label: 'Available' },
    { key: 'score', label: 'Score' },
    { key: 'reviews', label: 'Reviews' },
    { key: 'created', label: 'Created' },
  ];

  return generatePaginatedPdf(pdfData, columns, 'Admin - Flavours Report');
};

const exportReviewsPdf = async (pagination) => {
  const rows = await Review.findAll({
    limit: pagination.limit,
    offset: pagination.offset,
    order: [[pagination.sortBy, pagination.sortOrder]],
    include: [
      { model: User, as: 'user', attributes: ['name'] },
      { model: Flavour, as: 'flavour', attributes: ['name'] },
    ],
  });

  const pdfData = rows.map((r) => ({
    id: r.id,
    user: r.user?.name || '-',
    flavour: r.flavour?.name || '-',
    score: r.score,
    comment: (r.comment || '-').substring(0, 50),
    date: new Date(r.created_at).toLocaleDateString(),
  }));

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'user', label: 'User' },
    { key: 'flavour', label: 'Flavour' },
    { key: 'score', label: 'Score' },
    { key: 'comment', label: 'Comment' },
    { key: 'date', label: 'Date' },
  ];

  return generatePaginatedPdf(pdfData, columns, 'Admin - Reviews Report');
};

module.exports = {
  getAllFlavours,
  createFlavour,
  updateFlavour,
  deleteFlavour,
  getAllReviews,
  getDashboardStats,
  exportFlavoursPdf,
  exportReviewsPdf,
};
