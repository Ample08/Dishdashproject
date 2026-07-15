'use strict';

/**
 * Seeds brands + menu items, mirroring the frontend mock catalog
 * (frontend/src/data/menu.ts). `image_key`/`logo_key` map to the local
 * bundled assets the app already ships — the API only carries the data.
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert('brands', [
      {
        brand_key: 'Karaz',
        name: 'Karaz',
        cuisine: 'LEVANTINE · MEZZE & GRILL',
        tagline: 'Charcoal-grilled Levantine · family-run since 2019',
        rating: 4.7,
        rating_count: '1.3k',
        price_level: '$$',
        tags: 'Mezze · Grills',
        color: '#BC1E3C',
        logo_key: 'karazLogo',
        branch: 'Dubai Mall',
        distance: '0.8 km',
        address: 'Ground Floor · The Avenue',
        prep_time: 'Usually ready in 35–50 mins',
        categories: JSON.stringify(['Most Ordered', 'Mezze', 'Grills', 'Desserts', 'Drinks']),
        sort_order: 1,
        created_at: now,
        updated_at: now,
      },
      {
        brand_key: 'Jade',
        name: 'Jade',
        cuisine: 'MODERN ARABIC · FINE DINING',
        tagline: 'Refined Arabic plates · crafted for the evening',
        rating: 4.8,
        rating_count: '940',
        price_level: '$$$',
        tags: 'Mains · Mezze',
        color: '#1B4A55',
        logo_key: 'jadeLogo',
        branch: 'Yas Island',
        distance: '12 km',
        address: 'Yas Mall · Ground Level',
        prep_time: 'Usually ready in 40–60 mins',
        categories: JSON.stringify(['Most Ordered', 'Mezze', 'Mains', 'Desserts']),
        sort_order: 2,
        created_at: now,
        updated_at: now,
      },
    ]);

    const item = (o, sort) => ({
      slug: o.slug,
      brand_key: o.brand,
      name: o.name,
      description: o.desc,
      price: o.price,
      old_price: o.oldPrice ?? null,
      discount_pct: o.discountPct ?? null,
      category: o.category,
      image_key: o.image,
      popular: !!o.popular,
      sold_out: !!o.soldOut,
      sort_order: sort,
      created_at: now,
      updated_at: now,
    });

    const karaz = [
      { slug: 'k-truffle-hummus', brand: 'Karaz', name: 'Truffle Hummus', desc: 'Chickpea purée · black truffle · olive oil · pine nuts...', price: 65, category: 'Mezze', image: 'hummus', popular: true },
      { slug: 'k-mansaf', brand: 'Karaz', name: 'Mansaf Royale', desc: 'Lamb on jameed yogurt sauce · saffron rice almonds...', price: 78, category: 'Grills', image: 'mansaf', popular: true },
      { slug: 'k-shish', brand: 'Karaz', name: 'Shish Tawook', desc: 'Marinated chicken skewers · garlic toum · pickles...', price: 78, category: 'Grills', image: 'shish', popular: true },
      { slug: 'k-maklouba', brand: 'Karaz', name: 'Maklouba', desc: 'Upside-down spiced rice, chicken, eggplant pine nuts...', price: 55, oldPrice: 78, discountPct: 30, category: 'Grills', image: 'maklouba' },
      { slug: 'k-hummus', brand: 'Karaz', name: 'Hummus Beiruti', desc: 'Chickpea purée · tahini · parsley · pomegranate...', price: 78, category: 'Mezze', image: 'hummus', popular: true },
      { slug: 'k-kibbeh', brand: 'Karaz', name: 'Kibbeh Nayyeh', desc: 'Raw spiced lamb · bulgur · mint · onion · olive oil...', price: 78, category: 'Mezze', image: 'kibbeh' },
      { slug: 'k-fattoush', brand: 'Karaz', name: 'Fattoush Salad', desc: 'Mixed greens · sumac · pomegranate molasses · pita...', price: 78, category: 'Mezze', image: 'fattoush', soldOut: true },
      { slug: 'k-kanafeh', brand: 'Karaz', name: 'Kanafeh', desc: 'Sweet cheese · semolina · syrup · pistachio crumbs...', price: 78, category: 'Desserts', image: 'kanafeh' },
      { slug: 'k-phyllo', brand: 'Karaz', name: 'Creamy Phyllo Pistachio', desc: 'Crisp phyllo · ashta cream · pistachio · syrup...', price: 55, oldPrice: 78, discountPct: 30, category: 'Desserts', image: 'phyllo' },
      { slug: 'k-coffee', brand: 'Karaz', name: 'Lebanese Coffee', desc: 'Cardamom-spiced Arabic coffee · served with dates...', price: 78, category: 'Drinks', image: 'coffee' },
      { slug: 'k-ayran', brand: 'Karaz', name: 'Ayran', desc: 'Salted yogurt drink · fresh mint · ice...', price: 78, category: 'Drinks', image: 'ayran' },
    ];

    const jade = [
      { slug: 'j-cardamom-lamb', brand: 'Jade', name: 'Cardamom Lamb', desc: 'Slow-cooked lamb · cardamom · saffron rice · almonds...', price: 78, category: 'Mains', image: 'mansaf', popular: true },
      { slug: 'j-fukhara', brand: 'Jade', name: 'Fukhara Beans With Meat', desc: 'Slow-stewed beans · tender beef · tomato · spices...', price: 55, oldPrice: 78, discountPct: 30, category: 'Mains', image: 'maklouba', popular: true },
      { slug: 'j-mezze', brand: 'Jade', name: 'Garden Mezze Platter', desc: 'Hummus · moutabal · tabbouleh · vine leaves · pita...', price: 78, category: 'Mezze', image: 'hummus', popular: true },
      { slug: 'j-kanafeh', brand: 'Jade', name: 'Pistachio Kanafeh', desc: 'Sweet cheese · semolina · syrup · pistachio crumbs...', price: 78, category: 'Desserts', image: 'kanafeh' },
    ];

    const rows = [...karaz, ...jade].map((o, i) => item(o, i + 1));
    await queryInterface.bulkInsert('menu_items', rows);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('menu_items', null, {});
    await queryInterface.bulkDelete('brands', null, {});
  },
};
