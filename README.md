# EDU-SPHERE ERP System

A full-stack School ERP system for Superior College Samundri.

## Project Structure

```
SE Project (3)/
├── backend/                  ← Node.js + Express + Prisma + PostgreSQL API
│   ├── src/
│   │   ├── modules/          ← Auth, Students, Teachers, Fees, Attendance, etc.
│   │   ├── middleware/       ← JWT auth, error handling, validation
│   │   └── config/           ← Database, JWT, Multer config
│   ├── prisma/
│   │   ├── schema.prisma     ← Full database schema
│   │   └── seed.js           ← Admin + academic year seed
│   ├── scripts/
│   │   ├── extract-and-reimport.js  ← Full school data import (252 students)
│   │   ├── verify-db.js             ← Check DB record counts
│   │   └── test-all-apis.js         ← 25-test API validation suite
│   ├── .env.example          ← Environment variable template
│   └── package.json
│
└── SE Project (2)/SE Project/New folder/   ← Frontend (HTML/CSS/JS)
    ├── js/
    │   ├── auth.js           ← JWT auth, login, session management
    │   └── api.js            ← Full API wrapper for all modules
    ├── index.html            ← Role selection (Admin/Teacher/Student)
    ├── admin-login.html
    ├── index2.html           ← Admin dashboard
    ├── data-import.html      ← Import school data to PostgreSQL
    └── ...                   ← 60+ ERP pages
```

## Quick Start

### Backend
```bash
cd backend
npm install
cp .env.example .env        # Edit DATABASE_URL
npx prisma db push          # Create tables
npm run db:reset-import     # Import 252 students + 686 fee records
npm run dev                 # Start server on port 5000
```

### Frontend
Open `SE Project (2)/SE Project/New folder/index.html` in a browser
or use VS Code Live Server (port 5500).

## Tech Stack

**Backend:** Node.js, Express, Prisma ORM, PostgreSQL, JWT, bcrypt, multer  
**Frontend:** HTML5, Bootstrap 5, AdminLTE, ApexCharts, Vanilla JS  
**Database:** PostgreSQL (252 students, 686 fee records, 12 sections)

## API

Base URL: `http://localhost:5000/api/v1`

All endpoints require `Authorization: Bearer <token>` except login routes.

## Deployment

- **Backend:** Render.com (see `backend/render.yaml`)
- **Frontend:** Vercel / Netlify / GitHub Pages (static files)
- Update `AUTH.API_BASE` in `js/auth.js` to point to deployed backend URL
