const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUiDist = require('swagger-ui-dist');
const appRoutes = require('./routes/app');
const adminRoutes = require('./routes/admin');
const { appSpec, adminSpec } = require('./config/swagger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const ApiResponse = require('./utils/ApiResponse');

const logoPath = path.join(__dirname, '..', 'public', 'images', 'logo.jpeg');
const logoUrl = '/images/logo.jpeg';

// Custom docs page — Swagger header with App/Admin buttons on right (no search).
const docsHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="icon" href="${logoUrl}" type="image/jpeg" />
  <title>API Docs</title>
  <link rel="stylesheet" href="/api/docs/assets/swagger-ui.css" />
  <style>
    body { margin: 0; background: #fafafa; }
    .swagger-ui .topbar .download-url-wrapper { display: none !important; }
    .swagger-ui .topbar .wrapper {
      display: flex !important; align-items: center !important;
      justify-content: space-between !important; width: 100% !important;
    }
    #api-switch {
      display: flex; align-items: center; gap: 8px;
      margin-left: auto; padding-right: 16px;
    }
    #api-switch button {
      cursor: pointer; border: 1px solid rgba(255,255,255,.35); border-radius: 4px;
      padding: 7px 18px; font: 600 13px system-ui, sans-serif;
      color: #fff; background: transparent; transition: all .15s;
    }
    #api-switch button:hover { background: rgba(255,255,255,.12); border-color: #fff; }
    #api-switch button.active { background: #49cc90; border-color: #49cc90; color: #fff; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="/api/docs/assets/swagger-ui-bundle.js"></script>
  <script src="/api/docs/assets/swagger-ui-standalone-preset.js"></script>
  <script>
    function mountApiSwitch(active) {
      var wrapper = document.querySelector('.swagger-ui .topbar .wrapper');
      if (!wrapper) return;

      var switcher = document.getElementById('api-switch');
      if (!switcher) {
        switcher = document.createElement('div');
        switcher.id = 'api-switch';
        switcher.innerHTML =
          '<button id="btn-app" type="button">App API</button>' +
          '<button id="btn-admin" type="button">Admin API</button>';
        wrapper.appendChild(switcher);
        document.getElementById('btn-app').onclick = function () { loadSpec('app'); };
        document.getElementById('btn-admin').onclick = function () { loadSpec('admin'); };
      } else if (switcher.parentElement !== wrapper) {
        wrapper.appendChild(switcher);
      }

      document.getElementById('btn-app').classList.toggle('active', active === 'app');
      document.getElementById('btn-admin').classList.toggle('active', active === 'admin');
    }

    function loadSpec(which) {
      window.ui = SwaggerUIBundle({
        url: '/api/docs/' + which + '.json',
        dom_id: '#swagger-ui',
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
        layout: 'StandaloneLayout',
        persistAuthorization: true,
        deepLinking: true,
        onComplete: function () { mountApiSwitch(which); },
      });
    }

    loadSpec('app');
  </script>
</body>
</html>`;

// Public landing page shown at the root URL.
const homeHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="icon" href="${logoUrl}" type="image/jpeg" />
  <link rel="shortcut icon" href="${logoUrl}" type="image/jpeg" />
  <title>DishDash Flavours</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
      background: linear-gradient(135deg, #1b1b2f 0%, #2b2b47 100%);
      color: #e9eaf5; padding: 24px;
    }
    .card {
      background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08);
      border-radius: 18px; padding: 44px 40px; max-width: 460px; width: 100%;
      text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,.35);
    }
    .logo img { width: 64px; height: 64px; border-radius: 14px; object-fit: cover; margin-bottom: 10px; }
    h1 { font-size: 24px; font-weight: 700; margin-bottom: 6px; }
    .sub { color: #9aa0c7; font-size: 13px; letter-spacing: .5px; text-transform: uppercase; margin-bottom: 22px; }
    .notice {
      background: rgba(251,75,75,.12); border: 1px solid rgba(251,75,75,.3);
      color: #ffb3b3; border-radius: 10px; padding: 14px 16px; font-size: 14px; line-height: 1.5; margin-bottom: 26px;
    }
    .foot { margin-top: 24px; font-size: 12px; color: #6b7099; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo"><img src="${logoUrl}" alt="DishDash Flavours" /></div>
    <h1>DishDash Flavours</h1>
    <div class="sub">API Server</div>
    <div class="notice">
      This is the DishDash Flavours API server. Public access is not allowed.
    </div>
    <div class="foot">© DishDash Flavours</div>
  </div>
</body>
</html>`;

const createApp = () => {
  const app = express();
  app.set('trust proxy', 1);

  const getRequestBaseUrl = (req) => {
    const protocol = req.get('x-forwarded-proto')?.split(',')[0]?.trim() || req.protocol;
    return `${protocol}://${req.get('host')}`;
  };

  const withServerUrl = (spec, req) => ({
    ...spec,
    servers: [{ url: getRequestBaseUrl(req), description: 'Current server' }],
  });

  const sendLogo = (req, res) => res.type('image/jpeg').sendFile(logoPath);

  // Public landing page at root (before helmet so inline styles aren't blocked by CSP).
  app.get('/', (req, res) => res.type('html').send(homeHtml));

  // Logo & favicon (explicit routes work reliably on cPanel/Passenger).
  app.get('/favicon.ico', sendLogo);
  app.get('/favicon.jpeg', sendLogo);
  app.use('/images', express.static(path.join(__dirname, '..', 'public', 'images')));
  app.use('/public', express.static(path.join(__dirname, '..', 'public')));

  // --- API docs (mounted before helmet so its assets aren't blocked by CSP) ---
  app.use('/api/docs/assets', express.static(swaggerUiDist.getAbsoluteFSPath()));
  app.get('/api/docs/app.json', (req, res) => res.json(withServerUrl(appSpec, req)));
  app.get('/api/docs/admin.json', (req, res) => res.json(withServerUrl(adminSpec, req)));
  app.get('/api/docs', (req, res) => res.type('html').send(docsHtml));

  app.use(helmet());
  app.use(cors());
  app.use(morgan('dev'));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { success: false, statusCode: 429, message: 'Too many requests' },
  });
  app.use(limiter);

  app.get('/health', (req, res) => {
    return ApiResponse.success(res, { status: 'ok' }, 'Server is running');
  });

  app.use('/api/app', appRoutes);
  app.use('/api/admin', adminRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

module.exports = createApp;
