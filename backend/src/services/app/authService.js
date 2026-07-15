const { User } = require('../../models');
const { signToken } = require('../../utils/jwtHelper');
const {
  BadRequestError,
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} = require('../../utils/AppError');

const register = async ({ name, email, password, phone }) => {
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    throw new ConflictError('Email already registered');
  }

  const user = await User.create({ name, email, password, phone });
  const token = signToken({ id: user.id, email: user.email });

  const userData = user.toJSON();
  delete userData.password;

  return { user: userData, token };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });
  if (!user || !(await user.comparePassword(password))) {
    throw new UnauthorizedError('Invalid email or password');
  }

  if (!user.is_active) {
    throw new UnauthorizedError('Account is deactivated');
  }

  const token = signToken({ id: user.id, email: user.email });
  const userData = user.toJSON();
  delete userData.password;

  return { user: userData, token };
};

const getProfile = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password'] },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
};

const updateProfile = async (userId, data) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const { name, email, phone } = data;

  if (email && email !== user.email) {
    const clash = await User.findOne({ where: { email } });
    if (clash && clash.id !== user.id) {
      throw new ConflictError('Email already in use');
    }
  }

  const patch = {};
  if (name !== undefined) patch.name = name;
  if (email !== undefined) patch.email = email;
  if (phone !== undefined) patch.phone = phone;

  await user.update(patch);

  const userData = user.toJSON();
  delete userData.password;
  return userData;
};

module.exports = { register, login, getProfile, updateProfile };
