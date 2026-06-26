# EDU-SPHERE ERP System

A full-stack School ERP system for managing students, teachers, fees, attendance, exams, results, and library — all in one place.

## Project Structure

```
SE Project (3)/
├── backend/                          ← Node.js + Express + Prisma + PostgreSQL API
│   ├── src/
│   │   ├── modules/                  ← Auth, Students, Teachers, Fees, Attendance, etc.
│   │   ├── middleware/               ← JWT auth, error handling, validation
│   │   └── config/                   ← Database, JWT, Multer config
│   ├── prisma/
│   │   ├── schema.prisma             ← Full database schema
│   │   └── seed.js                   ← Admin + academic year seed
│   ├── scripts/
│   │   ├── extract-and-reimport.js   ← Full school data import (252 students)
│   │   ├── verify-db.js              ← Check DB record counts
│   │   └── test-all-apis.js          ← 25-test API validation suite
│   ├── .env.example                  ← Environment variable template
│   └── package.json
│
└── SE Project (2)/SE Project/New folder/   ← Frontend (HTML/CSS/JS)
    ├── js/
    │   ├── auth.js                   ← JWT auth, login, session management
    │   └── api.js                    ← Full API wrapper for all modules
    ├── index.html                    ← Role selection (Admin/Teacher/Student)
    ├── admin-login.html
    ├── index2.html                   ← Admin dashboard
    ├── data-import.html              ← Import school data to PostgreSQL
    └── ...                           ← 60+ ERP pages
```

## Quick Start

### Backend

```bash
cd backend
npm install
cp .env.example .env        # Edit DATABASE_URL
npx prisma db push          # Create tables
npm run db:seed             # Seed admin account
npm run db:reset-import     # Import 252 students + 686 fee records
npm run dev                 # Start server on port 5000
```

### Frontend

Open `SE Project (2)/SE Project/New folder/index.html` in a browser,
or use **VS Code Live Server** (port 5500).

> Make sure `js/auth.js` has `AUTH.API_BASE` pointing to `http://localhost:5000`.

## Authentication

The system uses **JWT-based role authentication** with the following roles:

| Role | Access |
|---|---|
| **Admin** | Full system access |
| **Teacher** | Classes, attendance, exams, results |
| **Student** | View attendance, results, library, fees |
| **Cashier** | Fee management only |
| **Librarian** | Library management only |

Default credentials are created during database seeding. **Change default passwords after first login.**

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Node.js, Express.js |
| **ORM** | Prisma |
| **Database** | PostgreSQL |
| **Auth** | JWT (Access + Refresh Tokens), bcryptjs |
| **File Uploads** | Multer |
| **Frontend** | HTML5, Bootstrap 5, AdminLTE 3, Vanilla JS |
| **Charts** | ApexCharts |
| **Excel Import** | SheetJS (xlsx) |

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with auto-restart |
| `npm start` | Start production server |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:seed` | Seed admin + academic year |
| `npm run db:reset-import` | Full reset + import all students & fee records |
| `npm run db:verify` | Check database record counts |
| `npm run db:studio` | Open Prisma Studio (visual DB GUI) |
| `npm run test:api` | Run full API test suite (25 tests) |

## API

**Base URL:** `http://localhost:5000/api/v1`

All endpoints require `Authorization: Bearer <token>` except login routes.

| Module | Endpoint |
|---|---|
| Auth | `/api/v1/auth` |
| Students | `/api/v1/students` |
| Teachers | `/api/v1/teachers` |
| Classes | `/api/v1/classes` |
| Subjects | `/api/v1/subjects` |
| Timetable | `/api/v1/timetable` |
| Attendance | `/api/v1/attendance` |
| Exams | `/api/v1/exams` |
| Results | `/api/v1/results` |
| Fees | `/api/v1/fees` |
| Accounts | `/api/v1/accounts` |
| Library | `/api/v1/library` |
| Announcements | `/api/v1/announcements` |
| Reports | `/api/v1/reports` |
| Import | `/api/v1/import` |
| System | `/api/v1/system` |

## Deployment

- **Backend:** Render.com — `render.yaml` is included in the `backend/` folder
- **Frontend:** Vercel / Netlify / GitHub Pages (static HTML, no build step needed)


