const { User } = require('../../models');
const { buildPaginationMeta } = require('../../middleware/pagination');
const { NotFoundError } = require('../../utils/AppError');

const getAllUsers = async (pagination) => {
  const { count, rows } = await User.findAndCountAll({
    attributes: { exclude: ['password'] },
    limit: pagination.limit,
    offset: pagination.offset,
    order: [[pagination.sortBy, pagination.sortOrder]],
  });

  return {
    users: rows,
    pagination: buildPaginationMeta(count, pagination),
  };
};

const toggleUserStatus = async (id) => {
  const user = await User.findByPk(id);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  await user.update({ is_active: !user.is_active });
  const userData = user.toJSON();
  delete userData.password;
  return userData;
};

module.exports = { getAllUsers, toggleUserStatus };
