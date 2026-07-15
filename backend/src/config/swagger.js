const config = require('./index');

const serverUrl = config.appUrl;

const securitySchemes = {
  ApiKeyAuth: {
    type: 'apiKey',
    in: 'header',
    name: 'api-key',
    description: `Required on every request. Copy & paste this value:\n\n${config.jwt.secret}`,
  },
  AccessToken: {
    type: 'apiKey',
    in: 'header',
    name: 'access-token',
    description: 'Paste the token from the login / verify-otp response.',
  },
};

/* ----------------------------- helpers ----------------------------- */
const ref = (name) => ({ $ref: `#/components/schemas/${name}` });
const arrayOf = (name) => ({ type: 'array', items: ref(name) });

/** 200 wrapper whose `data` is the given schema. */
const ok = (dataSchema, description = 'Success') => ({
  description,
  content: {
    'application/json': {
      schema: {
        allOf: [
          ref('SuccessResponse'),
          { type: 'object', properties: { data: dataSchema } },
        ],
      },
    },
  },
});

/** 201 wrapper. */
const created = (dataSchema, description = 'Created') => ok(dataSchema, description);

/** Paginated 200 wrapper (adds a `pagination` object). */
const paginated = (name, description = 'Success') => ({
  description,
  content: {
    'application/json': {
      schema: {
        allOf: [
          ref('SuccessResponse'),
          {
            type: 'object',
            properties: {
              data: arrayOf(name),
              pagination: ref('Pagination'),
            },
          },
        ],
      },
    },
  },
});

const err = (description) => ({
  description,
  content: { 'application/json': { schema: ref('ErrorResponse') } },
});

const secApiKey = [{ ApiKeyAuth: [] }];
const secAuth = [{ ApiKeyAuth: [], AccessToken: [] }];

const pathParam = (name, description) => ({
  name,
  in: 'path',
  required: true,
  schema: { type: 'string' },
  description,
});

const paginationParams = [
  { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
  { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
  { name: 'sortBy', in: 'query', schema: { type: 'string', default: 'created_at' } },
  { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['ASC', 'DESC'], default: 'DESC' } },
];

const jsonBody = (schema, required = true) => ({
  required,
  content: { 'application/json': { schema } },
});

/* ---------------------------- schemas ------------------------------ */
const commonSchemas = {
  SuccessResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      statusCode: { type: 'integer', example: 200 },
      message: { type: 'string', example: 'Success' },
      data: { type: 'object', nullable: true },
    },
  },
  ErrorResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      statusCode: { type: 'integer', example: 401 },
      message: { type: 'string', example: 'Unauthorized' },
      errors: { type: 'object', nullable: true },
    },
  },
  Pagination: {
    type: 'object',
    properties: {
      total: { type: 'integer', example: 24 },
      page: { type: 'integer', example: 1 },
      limit: { type: 'integer', example: 10 },
      totalPages: { type: 'integer', example: 3 },
      hasNextPage: { type: 'boolean', example: true },
      hasPrevPage: { type: 'boolean', example: false },
    },
  },
};

const appSchemas = {
  User: {
    type: 'object',
    properties: {
      id: { type: 'integer', example: 1 },
      name: { type: 'string', example: 'Aymen' },
      email: { type: 'string', nullable: true, example: 'aymen@dishdash.com' },
      phone: { type: 'string', nullable: true, example: '971501234567' },
      loyalty_points: { type: 'integer', example: 1550 },
      is_active: { type: 'boolean', example: true },
      created_at: { type: 'string', format: 'date-time' },
      updated_at: { type: 'string', format: 'date-time' },
    },
  },
  AuthResult: {
    type: 'object',
    properties: {
      user: ref('User'),
      token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
      isNewUser: { type: 'boolean', example: true },
    },
  },
  Brand: {
    type: 'object',
    properties: {
      id: { type: 'integer', example: 1 },
      brand_key: { type: 'string', example: 'Karaz' },
      name: { type: 'string', example: 'Karaz' },
      cuisine: { type: 'string', example: 'LEVANTINE · MEZZE & GRILL' },
      tagline: { type: 'string', example: 'Charcoal-grilled Levantine · family-run since 2019' },
      rating: { type: 'number', example: 4.7 },
      rating_count: { type: 'string', example: '1.3k' },
      price_level: { type: 'string', example: '$$' },
      tags: { type: 'string', example: 'Mezze · Grills' },
      color: { type: 'string', example: '#BC1E3C' },
      logo_key: { type: 'string', example: 'karazLogo' },
      branch: { type: 'string', example: 'Dubai Mall' },
      distance: { type: 'string', example: '0.8 km' },
      address: { type: 'string', example: 'Ground Floor · The Avenue' },
      prep_time: { type: 'string', example: 'Usually ready in 35–50 mins' },
      categories: { type: 'array', items: { type: 'string' }, example: ['Most Ordered', 'Mezze', 'Grills'] },
    },
  },
  MenuItem: {
    type: 'object',
    properties: {
      id: { type: 'integer', example: 2 },
      slug: { type: 'string', example: 'k-mansaf' },
      brand_key: { type: 'string', example: 'Karaz' },
      name: { type: 'string', example: 'Mansaf Royale' },
      description: { type: 'string', example: 'Lamb on jameed yogurt sauce · saffron rice almonds...' },
      price: { type: 'string', example: '78.00' },
      old_price: { type: 'string', nullable: true, example: null },
      discount_pct: { type: 'integer', nullable: true, example: null },
      category: { type: 'string', example: 'Grills' },
      image_key: { type: 'string', example: 'mansaf' },
      popular: { type: 'boolean', example: true },
      sold_out: { type: 'boolean', example: false },
    },
  },
  OrderItem: {
    type: 'object',
    properties: {
      slug: { type: 'string', nullable: true, example: 'k-mansaf' },
      name: { type: 'string', example: 'Mansaf Royale' },
      qty: { type: 'integer', example: 2 },
      price: { type: 'string', example: '78.00' },
    },
  },
  Order: {
    type: 'object',
    properties: {
      id: { type: 'integer', example: 1 },
      order_ref: { type: 'string', example: 'CRV-00001' },
      brand_key: { type: 'string', example: 'Karaz' },
      branch: { type: 'string', example: 'Dubai Mall' },
      item_count: { type: 'integer', example: 3 },
      subtotal: { type: 'string', example: '234.00' },
      service_fee: { type: 'string', example: '6.00' },
      vat: { type: 'string', example: '11.70' },
      total: { type: 'string', example: '251.70' },
      payment_method: { type: 'string', example: 'card' },
      status: { type: 'string', enum: ['placed', 'preparing', 'ready', 'pickedup'], example: 'placed' },
      stageIndex: { type: 'integer', example: 0 },
      stages: { type: 'array', items: { type: 'string' }, example: ['placed', 'preparing', 'ready', 'pickedup'] },
      placed_at: { type: 'string', format: 'date-time' },
      items: arrayOf('OrderItem'),
    },
  },
  ReservationBranch: {
    type: 'object',
    properties: {
      id: { type: 'integer', example: 1 },
      branch_key: { type: 'string', example: 'dubai-mall' },
      name: { type: 'string', example: 'Dubai Mall' },
      area: { type: 'string', example: 'Fashion Avenue · Downtown Dubai' },
      rating: { type: 'number', example: 4.7 },
      rating_count: { type: 'string', example: '2.1k' },
      tags: { type: 'array', items: { type: 'string' }, example: ['Arabic', 'Turkish'] },
      highlight: { type: 'string', example: 'Kids zone with a toy library' },
      most_loved: { type: 'string', example: 'Lamb Mansaf' },
      facts: { type: 'array', items: { type: 'string' } },
    },
  },
  Booking: {
    type: 'object',
    properties: {
      id: { type: 'integer', example: 1 },
      booking_ref: { type: 'string', example: 'BR-CRK-4083' },
      restaurant: { type: 'string', example: 'Karaz' },
      branch_key: { type: 'string', example: 'creek' },
      branch_name: { type: 'string', example: 'The Creek' },
      date_label: { type: 'string', example: 'Fri, Jul 18' },
      date_full: { type: 'string', example: 'Friday, Jul 18 · 2026' },
      time_label: { type: 'string', example: '7:30 PM' },
      guests: { type: 'integer', example: 4 },
      seating_label: { type: 'string', example: 'Terrace · Shisha Lounge' },
      note: { type: 'string', nullable: true },
      status: { type: 'string', enum: ['awaiting', 'confirmed', 'completed', 'cancelled'], example: 'awaiting' },
    },
  },
  CateringInquiry: {
    type: 'object',
    properties: {
      id: { type: 'integer', example: 1 },
      inquiry_ref: { type: 'string', example: '#CRV-1043' },
      event_type: { type: 'string', example: 'Wedding' },
      title: { type: 'string', example: 'Wedding Reception · 120 guests' },
      guests: { type: 'integer', example: 120 },
      date_label: { type: 'string', example: '20 Aug 2026' },
      location: { type: 'string', example: 'Palm Jumeirah' },
      budget: { type: 'string', nullable: true },
      requirements: { type: 'string', nullable: true },
      name: { type: 'string', example: 'Aymen' },
      email: { type: 'string', example: 'aymen@dishdash.com' },
      phone: { type: 'string', example: '50 123 4567' },
      status: { type: 'string', enum: ['awaiting', 'received'], example: 'awaiting' },
    },
  },
  Voucher: {
    type: 'object',
    properties: {
      id: { type: 'string', example: 'v-welcome' },
      kind: { type: 'string', enum: ['welcome', 'celebration'], example: 'welcome' },
      label: { type: 'string', example: 'WELCOME OFFER' },
      title: { type: 'string', example: 'Welcome' },
      discount: { type: 'string', example: '10%' },
      scope: { type: 'string', example: 'DINE-IN ONLY' },
      sub: { type: 'string', example: 'First dine-in' },
      action: { type: 'string', example: 'Unlock' },
      status: { type: 'string', enum: ['pending', 'available', 'claimed', 'used'], example: 'pending' },
      code: { type: 'string', example: 'WELCOME-A3F2K9' },
      guests: { type: 'integer', nullable: true },
    },
  },
  PointEntry: {
    type: 'object',
    properties: {
      id: { type: 'string', example: 'p1' },
      title: { type: 'string', example: "Chef's Table booked" },
      sub: { type: 'string', example: 'Jade · Dubai Mall · 3 Jun 2026' },
      delta: { type: 'integer', example: -800 },
      icon: { type: 'string', example: 'calendar-outline' },
    },
  },
  Experience: {
    type: 'object',
    properties: {
      id: { type: 'integer', example: 1 },
      exp_key: { type: 'string', example: 'x-chefs-table' },
      brand: { type: 'string', example: 'Jade' },
      title: { type: 'string', example: "Chef's Table" },
      location: { type: 'string', example: 'Jade · Dubai Mall' },
      description: { type: 'string' },
      pts: { type: 'integer', example: 800 },
      value: { type: 'string', example: 'AED 250 value' },
      tags: { type: 'array', items: { type: 'string' } },
      eligible: { type: 'boolean', example: true },
      need_more: { type: 'integer', nullable: true },
    },
  },
  LoyaltyBooking: {
    type: 'object',
    properties: {
      id: { type: 'string', example: 'lb-1' },
      brand: { type: 'string', example: 'Jade' },
      title: { type: 'string', example: "Chef's Table" },
      dateLabel: { type: 'string', example: 'Sat 6 Jun 2026 · 7:30 PM' },
      location: { type: 'string', example: 'Dubai Mall' },
      inDays: { type: 'integer', example: 4 },
      past: { type: 'boolean', example: false },
    },
  },
  Flavour: {
    type: 'object',
    properties: {
      id: { type: 'integer', example: 1 },
      name: { type: 'string', example: 'Butter Chicken' },
      description: { type: 'string' },
      category: { type: 'string', example: 'Main Course' },
      price: { type: 'string', example: '299.00' },
      image_url: { type: 'string', nullable: true },
      is_available: { type: 'boolean', example: true },
      average_score: { type: 'string', example: '4.50' },
      total_reviews: { type: 'integer', example: 10 },
    },
  },
};

const adminSchemas = {
  Admin: {
    type: 'object',
    properties: {
      id: { type: 'integer', example: 1 },
      name: { type: 'string', example: 'Super Admin' },
      email: { type: 'string', example: 'admin@dishdash.com' },
      role: { type: 'string', example: 'super_admin' },
      is_active: { type: 'boolean', example: true },
      created_at: { type: 'string', format: 'date-time' },
      updated_at: { type: 'string', format: 'date-time' },
    },
  },
};

/* ============================ APP API ============================ */
const appSpec = {
  openapi: '3.0.3',
  info: {
    title: 'DishDash Flavours — App API',
    version: '1.0.0',
    description:
      'Customer-facing API for the DishDash Flavours mobile app. Every request needs the **api-key** header; authenticated endpoints also need **access-token** (from login / verify-otp).',
  },
  servers: [{ url: serverUrl, description: 'Configured server (overridden per request in /api/docs)' }],
  tags: [
    { name: 'App - Auth', description: 'Phone/OTP + email login and profile' },
    { name: 'App - Menu', description: 'Brands & menu catalog' },
    { name: 'App - Orders', description: 'Placing & tracking orders' },
    { name: 'App - Reservations', description: 'Branches & table bookings' },
    { name: 'App - Catering', description: 'Catering inquiries' },
    { name: 'App - Loyalty', description: 'Points, vouchers, experiences' },
    { name: 'App - Flavours', description: 'Legacy demo catalog + reviews' },
  ],
  components: { securitySchemes, schemas: { ...commonSchemas, ...appSchemas } },
  paths: {
    /* ----- Auth ----- */
    '/api/app/register': {
      post: {
        tags: ['App - Auth'],
        summary: 'Register an app user (email + password)',
        security: secApiKey,
        requestBody: jsonBody({
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', example: 'Aymen' },
            email: { type: 'string', format: 'email', example: 'aymen@dishdash.com' },
            password: { type: 'string', format: 'password', example: 'Secret123' },
            phone: { type: 'string', example: '971501234567' },
          },
        }),
        responses: { 201: created(ref('AuthResult'), 'Registered'), 409: err('Email already registered'), 400: err('Validation failed') },
      },
    },
    '/api/app/login': {
      post: {
        tags: ['App - Auth'],
        summary: 'App user login (email + password)',
        security: secApiKey,
        requestBody: jsonBody({
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'user@dishdash.com' },
            password: { type: 'string', format: 'password', example: 'User@123' },
          },
        }),
        responses: { 200: ok(ref('AuthResult'), 'Login successful'), 401: err('Invalid email or password') },
      },
    },
    '/api/app/auth/request-otp': {
      post: {
        tags: ['App - Auth'],
        summary: 'Request a phone OTP',
        description: 'In mock mode the code is a fixed value (see OTP_FIXED_CODE) and is returned as `devCode` in the response — no real SMS is sent.',
        security: secApiKey,
        requestBody: jsonBody({
          type: 'object',
          required: ['phone'],
          properties: { phone: { type: 'string', example: '+971 50 1234567' } },
        }),
        responses: {
          200: ok({
            type: 'object',
            properties: {
              phone: { type: 'string', example: '971501234567' },
              expiresInMinutes: { type: 'integer', example: 10 },
              devCode: { type: 'string', example: '123456' },
            },
          }, 'OTP sent'),
          400: err('Valid phone number is required'),
        },
      },
    },
    '/api/app/auth/verify-otp': {
      post: {
        tags: ['App - Auth'],
        summary: 'Verify OTP & sign in',
        description: 'Verifies the code; creates the user on first login (phone-first signup). Returns a token + `isNewUser`.',
        security: secApiKey,
        requestBody: jsonBody({
          type: 'object',
          required: ['phone', 'code'],
          properties: {
            phone: { type: 'string', example: '+971 50 1234567' },
            code: { type: 'string', example: '123456' },
          },
        }),
        responses: { 200: ok(ref('AuthResult'), 'OTP verified'), 401: err('Invalid or expired code') },
      },
    },
    '/api/app/profile': {
      get: {
        tags: ['App - Auth'],
        summary: 'Get the signed-in user',
        security: secAuth,
        responses: { 200: ok(ref('User'), 'Profile fetched'), 401: err('Unauthorized') },
      },
      put: {
        tags: ['App - Auth'],
        summary: 'Update profile',
        security: secAuth,
        requestBody: jsonBody({
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Aymen' },
            email: { type: 'string', format: 'email', example: 'aymen@dishdash.com' },
            phone: { type: 'string', example: '971501234567' },
          },
        }),
        responses: { 200: ok(ref('User'), 'Profile updated'), 401: err('Unauthorized'), 409: err('Email already in use') },
      },
    },

    /* ----- Menu ----- */
    '/api/app/brands': {
      get: {
        tags: ['App - Menu'],
        summary: 'List brands',
        security: secApiKey,
        responses: { 200: ok(arrayOf('Brand'), 'Brands fetched') },
      },
    },
    '/api/app/brands/{key}': {
      get: {
        tags: ['App - Menu'],
        summary: 'Get a brand by key',
        security: secApiKey,
        parameters: [pathParam('key', 'Brand key, e.g. Karaz')],
        responses: { 200: ok(ref('Brand'), 'Brand fetched'), 404: err('Brand not found') },
      },
    },
    '/api/app/menu': {
      get: {
        tags: ['App - Menu'],
        summary: 'List menu items',
        description: 'Filter by `brand` and/or `category`. `category=Most Ordered` returns popular items.',
        security: secApiKey,
        parameters: [
          { name: 'brand', in: 'query', schema: { type: 'string', example: 'Karaz' } },
          { name: 'category', in: 'query', schema: { type: 'string', example: 'Grills' } },
        ],
        responses: { 200: ok(arrayOf('MenuItem'), 'Menu fetched') },
      },
    },
    '/api/app/menu/{slug}': {
      get: {
        tags: ['App - Menu'],
        summary: 'Get a menu item by slug',
        security: secApiKey,
        parameters: [pathParam('slug', 'Item slug, e.g. k-mansaf')],
        responses: { 200: ok(ref('MenuItem'), 'Menu item fetched'), 404: err('Menu item not found') },
      },
    },

    /* ----- Orders ----- */
    '/api/app/orders': {
      post: {
        tags: ['App - Orders'],
        summary: 'Place an order',
        description: 'Totals (subtotal, 5% VAT, service fee) are recomputed server-side.',
        security: secAuth,
        requestBody: jsonBody({
          type: 'object',
          required: ['brand', 'items'],
          properties: {
            brand: { type: 'string', example: 'Karaz' },
            branch: { type: 'string', example: 'Dubai Mall' },
            paymentMethod: { type: 'string', example: 'card' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                required: ['name', 'qty', 'price'],
                properties: {
                  slug: { type: 'string', example: 'k-mansaf' },
                  name: { type: 'string', example: 'Mansaf Royale' },
                  qty: { type: 'integer', example: 2 },
                  price: { type: 'number', example: 78 },
                },
              },
            },
          },
        }),
        responses: { 201: created(ref('Order'), 'Order placed'), 400: err('items must be a non-empty array'), 401: err('Unauthorized') },
      },
      get: {
        tags: ['App - Orders'],
        summary: 'List my orders (paginated)',
        security: secAuth,
        parameters: paginationParams,
        responses: { 200: paginated('Order', 'Orders fetched'), 401: err('Unauthorized') },
      },
    },
    '/api/app/orders/active': {
      get: {
        tags: ['App - Orders'],
        summary: 'Get my active (not-yet-picked-up) order',
        security: secAuth,
        responses: { 200: ok({ ...appSchemas.Order, nullable: true }, 'Active order fetched'), 401: err('Unauthorized') },
      },
    },
    '/api/app/orders/{ref}': {
      get: {
        tags: ['App - Orders'],
        summary: 'Get an order by ref (live status)',
        security: secAuth,
        parameters: [pathParam('ref', 'Order ref, e.g. CRV-00001')],
        responses: { 200: ok(ref('Order'), 'Order fetched'), 404: err('Order not found') },
      },
    },

    /* ----- Reservations ----- */
    '/api/app/branches': {
      get: {
        tags: ['App - Reservations'],
        summary: 'List reservable branches',
        security: secApiKey,
        responses: { 200: ok(arrayOf('ReservationBranch'), 'Branches fetched') },
      },
    },
    '/api/app/bookings': {
      post: {
        tags: ['App - Reservations'],
        summary: 'Create a booking',
        security: secAuth,
        requestBody: jsonBody({
          type: 'object',
          required: ['restaurant', 'branch'],
          properties: {
            restaurant: { type: 'string', example: 'Karaz' },
            branch: { type: 'string', example: 'creek' },
            branchName: { type: 'string', example: 'The Creek' },
            dateLabel: { type: 'string', example: 'Fri, Jul 18' },
            dateFull: { type: 'string', example: 'Friday, Jul 18 · 2026' },
            timeLabel: { type: 'string', example: '7:30 PM' },
            guests: { type: 'integer', example: 4 },
            seatingLabel: { type: 'string', example: 'Terrace · Shisha Lounge' },
            note: { type: 'string', example: 'Window seat please' },
          },
        }),
        responses: { 201: created(ref('Booking'), 'Booking created'), 401: err('Unauthorized') },
      },
      get: {
        tags: ['App - Reservations'],
        summary: 'List my bookings',
        security: secAuth,
        responses: { 200: ok(arrayOf('Booking'), 'Bookings fetched'), 401: err('Unauthorized') },
      },
    },
    '/api/app/bookings/{ref}': {
      get: {
        tags: ['App - Reservations'],
        summary: 'Get a booking by ref',
        security: secAuth,
        parameters: [pathParam('ref', 'Booking ref, e.g. BR-CRK-4083')],
        responses: { 200: ok(ref('Booking'), 'Booking fetched'), 404: err('Booking not found') },
      },
      patch: {
        tags: ['App - Reservations'],
        summary: 'Modify a booking',
        security: secAuth,
        parameters: [pathParam('ref', 'Booking ref')],
        requestBody: jsonBody({
          type: 'object',
          properties: {
            guests: { type: 'integer', example: 6 },
            note: { type: 'string' },
            time_label: { type: 'string', example: '8:00 PM' },
            date_label: { type: 'string' },
            status: { type: 'string', enum: ['awaiting', 'confirmed', 'completed', 'cancelled'] },
          },
        }),
        responses: { 200: ok(ref('Booking'), 'Booking updated'), 404: err('Booking not found') },
      },
    },
    '/api/app/bookings/{ref}/cancel': {
      post: {
        tags: ['App - Reservations'],
        summary: 'Cancel a booking',
        security: secAuth,
        parameters: [pathParam('ref', 'Booking ref')],
        responses: { 200: ok(ref('Booking'), 'Booking cancelled'), 404: err('Booking not found') },
      },
    },

    /* ----- Catering ----- */
    '/api/app/catering/inquiries': {
      post: {
        tags: ['App - Catering'],
        summary: 'Submit a catering inquiry',
        security: secAuth,
        requestBody: jsonBody({
          type: 'object',
          required: ['eventType'],
          properties: {
            eventType: { type: 'string', example: 'Wedding' },
            title: { type: 'string', example: 'Wedding Reception · 120 guests' },
            guests: { type: 'integer', example: 120 },
            dateLabel: { type: 'string', example: '20 Aug 2026' },
            location: { type: 'string', example: 'Palm Jumeirah' },
            budget: { type: 'string', example: 'AED 25,000' },
            requirements: { type: 'string' },
            name: { type: 'string', example: 'Aymen' },
            email: { type: 'string', example: 'aymen@dishdash.com' },
            phone: { type: 'string', example: '50 123 4567' },
          },
        }),
        responses: { 201: created(ref('CateringInquiry'), 'Inquiry submitted'), 401: err('Unauthorized') },
      },
      get: {
        tags: ['App - Catering'],
        summary: 'List my inquiries',
        security: secAuth,
        responses: { 200: ok(arrayOf('CateringInquiry'), 'Inquiries fetched'), 401: err('Unauthorized') },
      },
    },
    '/api/app/catering/inquiries/{ref}': {
      get: {
        tags: ['App - Catering'],
        summary: 'Get an inquiry by ref',
        security: secAuth,
        parameters: [pathParam('ref', 'Inquiry ref, e.g. #CRV-1043')],
        responses: { 200: ok(ref('CateringInquiry'), 'Inquiry fetched'), 404: err('Inquiry not found') },
      },
    },

    /* ----- Loyalty ----- */
    '/api/app/loyalty/summary': {
      get: {
        tags: ['App - Loyalty'],
        summary: 'Get my points balance',
        security: secAuth,
        responses: { 200: ok({ type: 'object', properties: { points: { type: 'integer', example: 1550 } } }, 'Loyalty summary'), 401: err('Unauthorized') },
      },
    },
    '/api/app/loyalty/experiences': {
      get: {
        tags: ['App - Loyalty'],
        summary: 'List experiences catalog',
        security: secApiKey,
        responses: { 200: ok(arrayOf('Experience'), 'Experiences fetched') },
      },
    },
    '/api/app/loyalty/experiences/{key}/book': {
      post: {
        tags: ['App - Loyalty'],
        summary: 'Book an experience with points',
        description: 'Creates a loyalty booking, deducts the experience points and logs a point-history entry.',
        security: secAuth,
        parameters: [pathParam('key', 'Experience key, e.g. x-chefs-table')],
        requestBody: jsonBody({
          type: 'object',
          properties: {
            dateLabel: { type: 'string', example: 'Sat 6 Jun 2026 · 7:30 PM' },
            inDays: { type: 'integer', example: 7 },
          },
        }, false),
        responses: { 201: created(ref('LoyaltyBooking'), 'Experience booked'), 404: err('Experience not found') },
      },
    },
    '/api/app/loyalty/vouchers': {
      get: {
        tags: ['App - Loyalty'],
        summary: 'List my vouchers',
        description: 'On first call the two starter vouchers are lazily created for the user.',
        security: secAuth,
        responses: { 200: ok(arrayOf('Voucher'), 'Vouchers fetched'), 401: err('Unauthorized') },
      },
    },
    '/api/app/loyalty/vouchers/{key}/claim': {
      post: {
        tags: ['App - Loyalty'],
        summary: 'Claim a voucher',
        security: secAuth,
        parameters: [pathParam('key', 'Voucher key, e.g. v-welcome')],
        responses: { 200: ok(ref('Voucher'), 'Voucher claimed'), 404: err('Voucher not found') },
      },
    },
    '/api/app/loyalty/vouchers/{key}/redeem': {
      post: {
        tags: ['App - Loyalty'],
        summary: 'Redeem (use) a voucher',
        security: secAuth,
        parameters: [pathParam('key', 'Voucher key')],
        responses: { 200: ok(ref('Voucher'), 'Voucher redeemed'), 404: err('Voucher not found') },
      },
    },
    '/api/app/loyalty/celebration': {
      post: {
        tags: ['App - Loyalty'],
        summary: 'Generate a celebration code',
        security: secAuth,
        requestBody: jsonBody({
          type: 'object',
          properties: { guests: { type: 'integer', example: 12 } },
        }),
        responses: { 200: ok(ref('Voucher'), 'Celebration code generated'), 404: err('Voucher not found') },
      },
    },
    '/api/app/loyalty/point-history': {
      get: {
        tags: ['App - Loyalty'],
        summary: 'Get my point history',
        security: secAuth,
        responses: { 200: ok(arrayOf('PointEntry'), 'Point history fetched'), 401: err('Unauthorized') },
      },
    },
    '/api/app/loyalty/bookings': {
      get: {
        tags: ['App - Loyalty'],
        summary: 'List my experience bookings',
        security: secAuth,
        responses: { 200: ok(arrayOf('LoyaltyBooking'), 'Loyalty bookings fetched'), 401: err('Unauthorized') },
      },
    },

    /* ----- Flavours (legacy) ----- */
    '/api/app/flavours': {
      get: {
        tags: ['App - Flavours'],
        summary: 'List flavours (paginated)',
        security: secApiKey,
        parameters: paginationParams,
        responses: { 200: paginated('Flavour', 'Flavours fetched') },
      },
    },
    '/api/app/flavours/{id}': {
      get: {
        tags: ['App - Flavours'],
        summary: 'Get a flavour by id',
        security: secApiKey,
        parameters: [{ ...pathParam('id', 'Flavour id'), schema: { type: 'integer' } }],
        responses: { 200: ok(ref('Flavour'), 'Flavour fetched'), 404: err('Flavour not found') },
      },
    },
    '/api/app/flavours/{id}/review': {
      post: {
        tags: ['App - Flavours'],
        summary: 'Add a review to a flavour',
        security: secAuth,
        parameters: [{ ...pathParam('id', 'Flavour id'), schema: { type: 'integer' } }],
        requestBody: jsonBody({
          type: 'object',
          required: ['score'],
          properties: {
            score: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
            comment: { type: 'string', example: 'Delicious!' },
          },
        }),
        responses: { 201: created(ref('Flavour'), 'Review added'), 401: err('Unauthorized') },
      },
    },
  },
};

/* ============================ ADMIN API ============================ */
const adminSpec = {
  openapi: '3.0.3',
  info: {
    title: 'DishDash Flavours — Admin API',
    version: '1.0.0',
    description: 'Management API. Every request needs **api-key**; authenticated endpoints also need an admin **access-token**.',
  },
  servers: [{ url: serverUrl, description: 'Configured server (overridden per request in /api/docs)' }],
  tags: [
    { name: 'Admin - Auth', description: 'Admin login & profile' },
    { name: 'Admin - Flavours', description: 'Flavour catalog management' },
    { name: 'Admin - Reviews', description: 'Reviews moderation' },
    { name: 'Admin - Users', description: 'User management' },
  ],
  components: { securitySchemes, schemas: { ...commonSchemas, ...appSchemas, ...adminSchemas } },
  paths: {
    '/api/admin/login': {
      post: {
        tags: ['Admin - Auth'],
        summary: 'Admin login',
        security: secApiKey,
        requestBody: jsonBody({
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'admin@dishdash.com' },
            password: { type: 'string', format: 'password', example: 'Admin@123' },
          },
        }),
        responses: {
          200: ok({ type: 'object', properties: { admin: ref('Admin'), token: { type: 'string' } } }, 'Admin login successful'),
          401: err('Invalid email or password'),
        },
      },
    },
    '/api/admin/profile': {
      get: {
        tags: ['Admin - Auth'],
        summary: 'Get admin details',
        security: secAuth,
        responses: { 200: ok(ref('Admin'), 'Admin profile fetched'), 401: err('Unauthorized') },
      },
    },
    '/api/admin/dashboard': {
      get: {
        tags: ['Admin - Auth'],
        summary: 'Dashboard stats',
        security: secAuth,
        responses: { 200: ok({ type: 'object' }, 'Dashboard stats'), 401: err('Unauthorized') },
      },
    },
    '/api/admin/flavours': {
      get: {
        tags: ['Admin - Flavours'],
        summary: 'List flavours (paginated)',
        security: secAuth,
        parameters: paginationParams,
        responses: { 200: paginated('Flavour', 'Flavours fetched'), 401: err('Unauthorized') },
      },
      post: {
        tags: ['Admin - Flavours'],
        summary: 'Create a flavour',
        security: secAuth,
        requestBody: jsonBody({
          type: 'object',
          required: ['name', 'category', 'price'],
          properties: {
            name: { type: 'string', example: 'Butter Chicken' },
            category: { type: 'string', example: 'Main Course' },
            price: { type: 'number', example: 299 },
            description: { type: 'string' },
            image_url: { type: 'string' },
            is_available: { type: 'boolean', example: true },
          },
        }),
        responses: { 201: created(ref('Flavour'), 'Flavour created'), 401: err('Unauthorized') },
      },
    },
    '/api/admin/flavours/{id}': {
      put: {
        tags: ['Admin - Flavours'],
        summary: 'Update a flavour',
        security: secAuth,
        parameters: [{ ...pathParam('id', 'Flavour id'), schema: { type: 'integer' } }],
        requestBody: jsonBody({
          type: 'object',
          properties: {
            name: { type: 'string' },
            category: { type: 'string' },
            price: { type: 'number' },
            description: { type: 'string' },
            image_url: { type: 'string' },
            is_available: { type: 'boolean' },
          },
        }),
        responses: { 200: ok(ref('Flavour'), 'Flavour updated'), 404: err('Flavour not found') },
      },
      delete: {
        tags: ['Admin - Flavours'],
        summary: 'Delete a flavour',
        security: secAuth,
        parameters: [{ ...pathParam('id', 'Flavour id'), schema: { type: 'integer' } }],
        responses: { 200: ok({ type: 'object', nullable: true }, 'Flavour deleted'), 404: err('Flavour not found') },
      },
    },
    '/api/admin/reviews': {
      get: {
        tags: ['Admin - Reviews'],
        summary: 'List reviews (paginated)',
        security: secAuth,
        parameters: paginationParams,
        responses: { 200: ok({ type: 'array', items: { type: 'object' } }, 'Reviews fetched'), 401: err('Unauthorized') },
      },
    },
    '/api/admin/users': {
      get: {
        tags: ['Admin - Users'],
        summary: 'List users (paginated)',
        security: secAuth,
        parameters: paginationParams,
        responses: { 200: paginated('User', 'Users fetched'), 401: err('Unauthorized') },
      },
    },
    '/api/admin/users/{id}/toggle-status': {
      patch: {
        tags: ['Admin - Users'],
        summary: 'Activate / deactivate a user',
        security: secAuth,
        parameters: [{ ...pathParam('id', 'User id'), schema: { type: 'integer' } }],
        responses: { 200: ok(ref('User'), 'User status updated'), 404: err('User not found') },
      },
    },
  },
};

module.exports = { appSpec, adminSpec };
