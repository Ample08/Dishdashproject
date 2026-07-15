const { Admin } = require('../../models');
const { signToken } = require('../../utils/jwtHelper');
const { UnauthorizedError, NotFoundError } = require('../../utils/AppError');

const login = async ({ email, password }) => {
  const admin = await Admin.findOne({ where: { email } });
  if (!admin || !(await admin.comparePassword(password))) {
    throw new UnauthorizedError('Invalid email or password');
  }

  if (!admin.is_active) {
    throw new UnauthorizedError('Admin account is deactivated');
  }

  const token = signToken({ id: admin.id, email: admin.email, role: admin.role });

  const adminData = admin.toJSON();
  delete adminData.password;

  return { admin: adminData, token };
};

const getProfile = async (adminId) => {
  const admin = await Admin.findByPk(adminId, {
    attributes: { exclude: ['password'] },
  });

  if (!admin) {
    throw new NotFoundError('Admin not found');
  }

  return admin;
};

module.exports = { login, getProfile };
