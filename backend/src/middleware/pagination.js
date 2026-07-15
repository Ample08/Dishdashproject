const { BadRequestError } = require('../utils/AppError');

const paginate = (req, res, next) => {
  let page = parseInt(req.query.page, 10) || 1;
  let limit = parseInt(req.query.limit, 10) || 10;

  if (page < 1) page = 1;
  if (limit < 1) limit = 10;
  if (limit > 100) limit = 100;

  const offset = (page - 1) * limit;

  req.pagination = {
    page,
    limit,
    offset,
    sortBy: req.query.sortBy || 'created_at',
    sortOrder: (req.query.sortOrder || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
  };

  next();
};

const buildPaginationMeta = (total, pagination) => {
  const totalPages = Math.ceil(total / pagination.limit) || 1;
  return {
    total,
    page: pagination.page,
    limit: pagination.limit,
    totalPages,
    hasNextPage: pagination.page < totalPages,
    hasPrevPage: pagination.page > 1,
  };
};

module.exports = { paginate, buildPaginationMeta };
