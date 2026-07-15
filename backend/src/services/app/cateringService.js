const {CateringInquiry} = require('../../models');
const {NotFoundError} = require('../../utils/AppError');

const createInquiry = async (userId, payload) => {
  const {
    eventType,
    title,
    guests,
    dateLabel,
    location,
    budget,
    requirements,
    name,
    email,
    phone,
  } = payload;

  const inquiry = await CateringInquiry.create({
    inquiry_ref: `TMP-${Date.now()}`,
    user_id: userId || null,
    event_type: eventType || 'Other',
    title: title || 'Catering',
    guests: parseInt(guests, 10) || 0,
    date_label: dateLabel || 'Date TBC',
    location: location || 'UAE',
    budget: budget || null,
    requirements: requirements || null,
    name: name || null,
    email: email || null,
    phone: phone || null,
    status: 'awaiting',
  });

  await inquiry.update({
    inquiry_ref: `#CRV-${1042 + inquiry.id}`,
  });

  return inquiry;
};

const listInquiries = async (userId) =>
  CateringInquiry.findAll({
    where: {user_id: userId},
    order: [['created_at', 'DESC']],
  });

const getInquiryByRef = async (userId, ref) => {
  const inquiry = await CateringInquiry.findOne({
    where: {inquiry_ref: ref, user_id: userId},
  });
  if (!inquiry) throw new NotFoundError('Inquiry not found');
  return inquiry;
};

module.exports = {createInquiry, listInquiries, getInquiryByRef};
