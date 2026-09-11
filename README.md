# 🎓 Class Student Directory & Collaboration Portal

A premium, production-quality full-stack web application where students register once and
appear in a searchable class directory, while admins get full CRUD control, live analytics, and
one-click CSV/Excel export — backed by a PostgreSQL database (Neon) for production use.

---

## ✨ Features

- **Public landing page** — hero, features, about, and CTA sections with smooth Framer Motion animations
- **Student self-registration** — one form, fully validated (client + server), duplicate USN/email protection
- **Student directory** — instant search, filter by section/domain, sort, pagination, and profile cards with LinkedIn/GitHub/Portfolio buttons
- **Admin dashboard** — total students, section-wise and domain-wise charts, recent registrations
- **Admin student management** — searchable table, edit (dialog + form), delete (with confirmation), CSV & Excel export
- **JWT authentication** — protected admin routes, bcrypt-hashed passwords
- **Security hardening** — Helmet, CORS, rate limiting, input validation & sanitization (XSS/SQLi protection via Prisma + express-validator)
- **Premium dark UI** — glassmorphism, gold/teal accents on navy, Syne + DM Sans typography, fully responsive

---

## 🏗️ Tech Stack

| Layer          | Technology                                                        |
| -------------- | ------------------------------------------------------------------ |
| Frontend       | React 18 + Vite + TypeScript + Tailwind CSS + shadcn-style UI kit  |
| Forms          | React Hook Form + Zod                                             |
| Animation      | Framer Motion                                                     |
| Icons / Charts | Lucide Icons + Recharts                                           |
| Backend        | Node.js + Express + TypeScript                                    |
| Database       | PostgreSQL (Neon) via Prisma ORM                                  |
| Auth           | JWT + bcrypt                                                       |

---

## 📁 Folder Structure

```
studentportal/
├── client/                      # React + Vite frontend
│   └── src/
│       ├── components/
│       │   ├── ui/              # shadcn-style primitives (Button, Card, Dialog, Select...)
│       │   ├── layout/          # Navbar, Footer, PublicLayout, AdminLayout
│       │   └── shared/          # StudentForm, StudentCard, StatCard, EmptyState...
│       ├── pages/                # Home, Register, Directory, AdminLogin, AdminDashboard, AdminStudents
│       ├── hooks/                # useAuth, useToast
│       ├── services/             # api.ts, students.service.ts, auth.service.ts
│       ├── types/                # shared TS interfaces
│       └── utils/                # zod validation schemas
│
├── server/                      # Express + TypeScript backend
│   ├── prisma/
│   │   ├── schema.prisma        # Student & Admin models (PostgreSQL)
│   │   └── seed.ts              # creates the default admin account
│   └── src/
│       ├── routes/               # auth, students, dashboard
│       ├── controllers/          # request handlers
│       ├── middleware/           # auth, validation, rate limiting, error handling
│       ├── utils/                # jwt, csv/excel export
│       └── config/               # prisma client singleton
│
└── package.json                 # root orchestration (concurrently)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Install & Run

From the **project root**:

```bash
npm install
npm run dev
```

That's it. `npm install` will:
1. Install root, `server`, and `client` dependencies
2. Generate the Prisma client
3. Run migrations against your PostgreSQL database to create the `students` and `admins` tables
4. Seed a default admin account

`npm run dev` then starts:
- **Backend** on `http://localhost:5000`
- **Frontend** on `http://localhost:5173` (proxies `/api` to the backend)

Open `http://localhost:5173` in your browser.

### Default Admin Credentials

Set in `server/.env` (copy from `.env.example` if missing):

```
ADMIN_EMAIL=admin@classportal.com
ADMIN_PASSWORD=Admin@12345
```

⚠️ **Change these in production** — go to `/admin/login`, log in, and update the admin record directly in the database (or extend the app with a "change password" endpoint).

### Environment Variables (`server/.env`)

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DBNAME?sslmode=require"
PORT=5000
JWT_SECRET="change_this_to_a_long_random_secret_in_production"
JWT_EXPIRES_IN="1d"
CLIENT_ORIGIN="http://localhost:5173"
ADMIN_EMAIL="admin@classportal.com"
ADMIN_PASSWORD="Admin@12345"
```

If you ever need to reset the database, run:
```bash
cd server && npx prisma migrate reset --force
```
This drops all tables and re-applies migrations, then you can re-seed with `npm run seed`.

---

## 🔌 API Reference

Base URL: `http://localhost:5000/api`

| Method | Endpoint                     | Auth      | Description                          |
| ------ | ----------------------------- | --------- | ------------------------------------- |
| POST   | `/auth/login`                 | Public    | Admin login, returns JWT              |
| GET    | `/auth/me`                    | Protected | Current admin profile                 |
| POST   | `/students`                   | Public    | Register a new student                |
| GET    | `/students`                   | Public    | List students (search/filter/sort/paginate) |
| GET    | `/students/:id`               | Public    | Get one student                       |
| PUT    | `/students/:id`               | Protected | Update a student                      |
| DELETE | `/students/:id`               | Protected | Delete a student                      |
| GET    | `/students/meta/filters`      | Public    | Distinct sections & domains for filters |
| GET    | `/students/export/csv`        | Protected | Download all students as CSV          |
| GET    | `/students/export/excel`      | Protected | Download all students as Excel        |
| GET    | `/dashboard`                  | Protected | Aggregate stats for the admin dashboard |

Protected routes require `Authorization: Bearer <token>`.

### Query params for `GET /students`
`search`, `section`, `favoriteDomain`, `sortBy` (`name`|`usn`|`section`|`createdAt`|`favoriteDomain`), `order` (`asc`|`desc`), `page`, `limit`

---

## 🔐 Security Notes

- Passwords hashed with **bcrypt** (12 salt rounds)
- **JWT** signed tokens for admin sessions, verified via middleware on every protected route
- **Helmet** sets secure HTTP headers
- **CORS** restricted to the configured client origin
- **Rate limiting**: general API (300/15min), login (10/15min), public registration (30/15min)
- **express-validator** enforces strict field-level validation (email, phone, URL patterns, USN format) matched on both client (Zod) and server
- **XSS sanitization** strips HTML from free-text fields before storage
- **SQL injection protection** is inherent to Prisma's parameterized queries — no raw SQL is used anywhere in this project

---

## 🗄️ Database Schema

```prisma
model Student {
  id             String   @id @default(cuid())
  name           String
  usn            String   @unique
  section        String
  phone          String
  email          String   @unique
  linkedin       String
  github         String
  portfolio      String?
  favoriteDomain String
  skills         String
  bio            String?
  photo          String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model Admin {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  name         String   @default("Administrator")
  createdAt    DateTime @default(now())
}
```

---

## 🧭 Available Scripts (root)

| Command                 | Description                                        |
| ------------------------ | --------------------------------------------------- |
| `npm install`             | Installs everything and sets up the database        |
| `npm run dev`              | Runs backend + frontend together                    |
| `npm run dev:server`       | Runs only the backend                                |
| `npm run dev:client`       | Runs only the frontend                               |
| `npm run build`            | Production build for both backend and frontend       |
| `npm run db:setup`         | Re-generates Prisma client, migrates, and seeds admin |

---

## 📝 Notes

- Profile photos are stored as base64 data URLs directly in the database (kept under 1.5MB client-side) — no external file storage or cloud buckets are used, per the "manual storage mode" requirement.
- The frontend dev server proxies `/api/*` to `http://localhost:5000`, so no CORS configuration is needed in development.
- For a production deployment, build both apps (`npm run build`), serve the compiled `client/dist` via a static host or from Express, and run `node server/dist/index.js` behind a process manager.
