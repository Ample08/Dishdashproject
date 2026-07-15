const { Op } = require('sequelize');
const { User, OtpCode } = require('../../models');
const { signToken } = require('../../utils/jwtHelper');
const config = require('../../config');
const {
  BadRequestError,
  UnauthorizedError,
} = require('../../utils/AppError');

/** Keep only digits and a single leading + is dropped; store normalized. */
const normalizePhone = (phone) => String(phone || '').replace(/[^\d]/g, '');

const generateCode = () => {
  if (config.otp.mock) return config.otp.fixedCode;
  // 6-digit non-crypto code; fine for OTP.
  return String(Math.floor(100000 + Math.random() * 900000));
};

/**
 * Request an OTP for a phone number. In mock mode the code is fixed and
 * returned in the response so the app/dev can log in without real SMS.
 */
const requestOtp = async ({ phone }) => {
  const normalized = normalizePhone(phone);
  if (normalized.length < 6) {
    throw new BadRequestError('Valid phone number is required');
  }

  const code = generateCode();
  const expiresAt = new Date(Date.now() + config.otp.expiryMinutes * 60 * 1000);

  // Invalidate any previous unconsumed codes for this phone.
  await OtpCode.update(
    { consumed: true },
    { where: { phone: normalized, consumed: false } }
  );

  await OtpCode.create({ phone: normalized, code, expires_at: expiresAt });

  return {
    phone: normalized,
    expiresInMinutes: config.otp.expiryMinutes,
    // Only surface the code in mock/dev mode — never in real SMS production.
    devCode: config.otp.mock ? code : undefined,
  };
};

/**
 * Verify an OTP; create the user on first login (phone-first signup).
 * Returns { user, token, isNewUser }.
 */
const verifyOtp = async ({ phone, code }) => {
  const normalized = normalizePhone(phone);
  if (!normalized || !code) {
    throw new BadRequestError('Phone and code are required');
  }

  // In mock mode the fixed code always passes.
  const mockPass = config.otp.mock && code === config.otp.fixedCode;

  if (!mockPass) {
    const record = await OtpCode.findOne({
      where: {
        phone: normalized,
        code,
        consumed: false,
        expires_at: { [Op.gt]: new Date() },
      },
      order: [['created_at', 'DESC']],
    });

    if (!record) {
      throw new UnauthorizedError('Invalid or expired code');
    }
    await record.update({ consumed: true });
  } else {
    // Consume any pending codes so they can't be reused.
    await OtpCode.update(
      { consumed: true },
      { where: { phone: normalized, consumed: false } }
    );
  }

  let user = await User.findOne({ where: { phone: normalized } });
  let isNewUser = false;

  if (!user) {
    user = await User.create({ phone: normalized, name: 'Guest' });
    isNewUser = true;
  }

  if (!user.is_active) {
    throw new UnauthorizedError('Account is deactivated');
  }

  const token = signToken({ id: user.id, phone: user.phone });
  const userData = user.toJSON();
  delete userData.password;

  return { user: userData, token, isNewUser };
};

module.exports = { requestOtp, verifyOtp, normalizePhone };
