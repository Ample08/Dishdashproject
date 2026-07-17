# DishDash Flavours - React Admin Panel

Simple responsive admin panel — login, dashboard, sidebar, header, footer aur profile dropdown.

## Kaise chalayein

1. Is folder (`DishDash-Flavours`) ko kisi bhi jagah copy / zip bhej sakte ho
2. Terminal kholo is folder me
3. Commands chalao:

```bash
npm install
npm run dev
```

Browser me khulega: **http://localhost:3000**

## Login (Demo)

| Field    | Value            |
|----------|------------------|
| Email    | admin@admin.com  |
| Password | 123456           |

## Production build

```bash
npm run build
npm run preview
```

`dist` folder me ready files milengi.

## Folder structure

```
DishDash-Flavours/
├── src/
│   ├── components/layout/   Sidebar, Header, Footer
│   ├── context/AuthContext.jsx
│   ├── pages/Login.jsx
│   ├── pages/Dashboard.jsx
│   └── config/app.js        Project name yahan se change hota hai
├── package.json
├── vite.config.js
└── index.html
```
