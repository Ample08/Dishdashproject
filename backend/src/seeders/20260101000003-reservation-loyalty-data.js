'use strict';

/**
 * Seeds reservation branches + loyalty experiences, mirroring
 * frontend/src/data/reservations.ts and data/loyalty.ts. Images stay bundled
 * in the app; the API references them by key (photo_key / branch_key).
 */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const J = JSON.stringify;

    await queryInterface.bulkInsert('branches', [
      {
        branch_key: 'dubai-mall',
        name: 'Dubai Mall',
        area: 'Fashion Avenue · Downtown Dubai',
        rating: 4.7,
        rating_count: '2.1k',
        tags: J(['Arabic', 'Turkish', 'Fast food']),
        highlight: 'Kids zone with a toy library',
        most_loved: 'Lamb Mansaf',
        facts: J([
          'Avg. table held 12 min past slot',
          'Window seats face the fountain',
          'Live oud on Thursday nights',
        ]),
        photo_key: 'dubai-mall',
        photos: J([]),
        sort_order: 1,
        created_at: now,
        updated_at: now,
      },
      {
        branch_key: 'creek',
        name: 'The Creek',
        area: 'Festival Avenue · Dubai Festival City',
        rating: 4.6,
        rating_count: '1.8k',
        tags: J(['Seafood', 'Grill', 'Levantine']),
        highlight: 'Marina-view terrace deck',
        most_loved: 'Grilled Hammour',
        facts: J([
          'Terrace overlooks the marina',
          'Sunset slots book out fastest',
          'Shisha lounge on the deck',
        ]),
        photo_key: 'creek',
        photos: J([]),
        sort_order: 2,
        created_at: now,
        updated_at: now,
      },
      {
        branch_key: 'yas-island',
        name: 'Yas Island',
        area: 'Yas Bay Waterfront · Abu Dhabi',
        rating: 4.8,
        rating_count: '1.2k',
        tags: J(['Emirati', 'Fine dining', 'Rooftop']),
        highlight: 'Rooftop skyline lounge',
        most_loved: 'Camel Slider',
        facts: J([
          'Rooftop bar with skyline view',
          'Valet parking after 6 PM',
          'Private booths for groups of 6+',
        ]),
        photo_key: 'yas-island',
        photos: J([]),
        sort_order: 3,
        created_at: now,
        updated_at: now,
      },
    ]);

    await queryInterface.bulkInsert('experiences', [
      {
        exp_key: 'x-chefs-table',
        brand: 'Jade',
        title: "Chef's Table",
        location: 'Jade · Dubai Mall',
        description:
          'Three-course tasting curated by our head chef. Seasonal ingredients, served at the kitchen counter with chef commentary.',
        pts: 800,
        value: 'AED 250 value',
        tags: J(['Table for 2–4', '~2 hrs', 'Halal']),
        eligible: true,
        need_more: null,
        photo_key: 'dubai-mall',
        sort_order: 1,
        created_at: now,
        updated_at: now,
      },
      {
        exp_key: 'x-private-dining',
        brand: 'Jade',
        title: 'Private Dining Room',
        location: 'Jade · Dubai Mall',
        description:
          'An intimate room for your table — curated menu, dedicated service, skyline views.',
        pts: 2000,
        value: 'AED 600 value',
        tags: J(['Table for 6–10', '~3 hrs', 'Halal']),
        eligible: false,
        need_more: 750,
        photo_key: 'yas-island',
        sort_order: 2,
        created_at: now,
        updated_at: now,
      },
      {
        exp_key: 'x-weekend-special',
        brand: 'Karaz',
        title: 'Weekend Special',
        location: 'Karaz · JBR',
        description:
          'Sommelier-led pairing with our seasonal menu and live oud.',
        pts: 1500,
        value: 'AED 400 value',
        tags: J(['Table for 2–4', '~2 hrs', 'Halal']),
        eligible: false,
        need_more: 250,
        photo_key: 'creek',
        sort_order: 3,
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('experiences', null, {});
    await queryInterface.bulkDelete('branches', null, {});
  },
};
