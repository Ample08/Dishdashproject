'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const hashedAdmin = await bcrypt.hash('Admin@123', 12);
    const hashedUser = await bcrypt.hash('User@123', 12);

    await queryInterface.bulkInsert('admins', [
      {
        name: 'Super Admin',
        email: 'admin@dishdash.com',
        password: hashedAdmin,
        role: 'super_admin',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    await queryInterface.bulkInsert('users', [
      {
        name: 'Test User',
        email: 'user@dishdash.com',
        password: hashedUser,
        phone: '9876543210',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    await queryInterface.bulkInsert('flavours', [
      {
        name: 'Butter Chicken',
        description: 'Creamy tomato-based curry with tender chicken',
        category: 'Main Course',
        price: 299.0,
        is_available: true,
        average_score: 4.5,
        total_reviews: 10,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Paneer Tikka',
        description: 'Grilled cottage cheese with spices',
        category: 'Starter',
        price: 199.0,
        is_available: true,
        average_score: 4.2,
        total_reviews: 8,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Biryani Special',
        description: 'Aromatic basmati rice with spices',
        category: 'Main Course',
        price: 349.0,
        is_available: true,
        average_score: 4.8,
        total_reviews: 15,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('reviews', null, {});
    await queryInterface.bulkDelete('flavours', null, {});
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('admins', null, {});
  },
};
