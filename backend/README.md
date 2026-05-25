# EDU-SPHERE ERP — Backend API

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure database
Edit `.env` — set your PostgreSQL connection:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/edusphere_db"
```

### 3. Push schema to database
```bash
npm run db:push
```

### 4. Import all school data (252 students + 686 fee records)
```bash
npm run db:reset-import
```

### 5. Start the server
```bash
npm run dev        # development (auto-restart)
npm start          # production
```

Server runs on: **http://localhost:5000**

---

## Admin Login
- **URL:** http://localhost:5000/api/v1/auth/admin/login
- **Username:** `admin`
- **Password:** `admin123`

## Student Login
- **URL:** http://localhost:5000/api/v1/auth/student/login
- **Roll No:** e.g. `201` or `C-1-201`
- **Password:** same as roll number (first login)

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start with nodemon (auto-restart) |
| `npm start` | Start production server |
| `npm run db:push` | Push Prisma schema to PostgreSQL |
| `npm run db:seed` | Seed admin + academic year only |
| `npm run db:reset-import` | Full reset + import 252 students + 686 fee records |
| `npm run db:verify` | Check database record counts |
| `npm run test:api` | Run all API tests (server must be running) |

---

## Database Summary (after import)
- **Students:** 252
- **Fee Records:** 686
- **Classes:** 1 (1st Year)
- **Sections:** 12 (C-1, M-1, C-2Eco, E-1, I.Com 1, IT-1, M-4, C-3, C-4, C-5, IT-2, E-2)
- **School:** Superior College Samundri — Session 2025-2027

---

## API Endpoints

| Module | Base Path |
|---|---|
| Auth | `/api/v1/auth` |
| Students | `/api/v1/students` |
| Teachers | `/api/v1/teachers` |
| Classes | `/api/v1/classes` |
| Subjects | `/api/v1/subjects` |
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
