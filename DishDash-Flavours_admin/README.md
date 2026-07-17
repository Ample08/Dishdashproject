# Flavours by DishDash — Admin Suite

A premium, fully-responsive **multi-tenant Food Ordering SaaS** admin panel.
Hierarchy: **Super Admin → Brand → Branch → Staff** with role-based access (RBAC).

Theme is pulled from the app's Figma — warm cream + pistachio green + ink navy,
Playfair Display headings + Lato body.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
```

Production build:

```bash
npm run build && npm run preview
```

## Demo logins

Password for all roles: **`123456`**

| Role | Email | Sees |
|------|-------|------|
| Super Admin | `owner@flavours.ae` | All brands, branches, everything |
| Brand Admin | `brand@flavours.ae` | One brand + all its branches |
| Branch Manager | `marina@flavours.ae` | A single branch |
| Branch Staff | `sara@flavours.ae` | One branch, limited modules |

> Quick-login buttons on the sign-in screen, plus a **role switcher in the header**
> let you instantly preview every perspective (great for demos).

## What's inside

- **Role-aware dashboard** — KPIs (animated), revenue chart, order-status donut,
  brand/branch performance, live orders, top dishes — all scoped to the logged-in role.
- **Modules** — Orders, Menu, Customers, Brands, Branches, Staff & Roles
  (permission matrix), Offers & Coupons, Reports, Settings.
- **RBAC** — sidebar, routes and data all filter by role & permission.

## Structure

```
src/
├── config/        app.js (brand/currency) · roles.js (RBAC + nav)
├── context/       AuthContext.jsx (role-aware auth + role switch)
├── data/          db.js (mock brands, branches, staff, menu, orders…)
├── hooks/         useCountUp.js
├── components/
│   ├── layout/    Sidebar · Header · AdminLayout · Footer
│   └── ui/        KPICard · Charts (SVG) · PageHeader
├── pages/         Dashboard, Orders, Menu, Customers, Brands,
│                  Branches, Staff, Offers, Reports, Settings, Login
├── index.css      full design system (theme tokens + components)
└── App.jsx        routes + permission guards
```

The whole theme is driven by CSS variables at the top of `src/index.css`, and the
brand name / currency live in `src/config/app.js`.
