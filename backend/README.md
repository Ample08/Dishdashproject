# DishDash Flavours API

Node.js REST API with **App API** (customers) and **Admin API** (management).  
JWT authentication, custom error classes, pagination (latest first), and PDF export.

---

## Folder Structure

```
DishDash-Flavours/
├── database/
│   └── create_database.sql      # XAMPP me database banane ke liye
├── src/
│   ├── config/                  # DB & JWT config
│   ├── controllers/
│   │   ├── app/                 # Customer app controllers
│   │   └── admin/               # Admin panel controllers
│   ├── middleware/              # Auth, pagination, errors
│   ├── migrations/              # Database tables (Sequelize)
│   ├── models/                  # Sequelize models
│   ├── routes/
│   │   ├── app/                 # /api/app/*
│   │   └── admin/               # /api/admin/*
│   ├── seeders/                 # Demo data
│   ├── services/                # Business logic
│   ├── utils/                   # AppError, ApiResponse, JWT, PDF
│   ├── validators/              # Request validation
│   ├── app.js                   # Express setup
│   └── server.js                # Entry point
├── .env                         # Environment variables
├── .env.example
└── package.json
```

---

## Step 1: XAMPP Start Karein

1. XAMPP Control Panel open karein
2. **Apache** aur **MySQL** start karein
3. Browser me `http://localhost/phpmyadmin` open karein

---

## Step 2: Database Banayein

**Option A – phpMyAdmin:**
1. phpMyAdmin → SQL tab
2. `database/create_database.sql` ka content paste karke Run karein

**Option B – Manual:**
- New database name: `dishdash_flavours`
- Collation: `utf8mb4_unicode_ci`

---

## Step 3: Project Setup

```powershell
cd c:\xampp\htdocs\DishDash-Flavours
npm install
```

`.env` file already created hai. Agar MySQL password set hai to `DB_PASSWORD` update karein.

---

## Step 4: Migration Run Karein

```powershell
npm run db:migrate
npm run db:seed
```

**Full reset:**
```powershell
npm run db:reset
```

---

## Step 5: Server Run Karein

```powershell
npm run dev
```

Server: `http://localhost:3000`  
Health check: `GET http://localhost:3000/health`

---

## Demo Login

| Role  | Email               | Password   |
|-------|---------------------|------------|
| Admin | admin@dishdash.com  | Admin@123  |
| User  | user@dishdash.com   | User@123   |

---

## JWT Header

```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Pagination Query Params

- `page` (default: 1)
- `limit` (default: 10, max: 100)
- `sortBy` (default: created_at)
- `sortOrder` (default: DESC – latest first)
