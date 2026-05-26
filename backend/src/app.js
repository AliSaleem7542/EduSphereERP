const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const { notFound } = require('./middleware/notFound');
const { errorHandler } = require('./middleware/errorHandler');

// ─── Route Imports ────────────────────────────────────────────────────────────
const authRoutes = require('./modules/auth/auth.routes');
const studentRoutes = require('./modules/students/students.routes');
const teacherRoutes = require('./modules/teachers/teachers.routes');
const classRoutes = require('./modules/classes/classes.routes');
const subjectRoutes = require('./modules/subjects/subjects.routes');
const timetableRoutes = require('./modules/timetable/timetable.routes');
const attendanceRoutes = require('./modules/attendance/attendance.routes');
const examRoutes = require('./modules/exams/exams.routes');
const resultRoutes = require('./modules/results/results.routes');
const feeRoutes = require('./modules/fees/fees.routes');
const accountRoutes = require('./modules/accounts/accounts.routes');
const libraryRoutes = require('./modules/library/library.routes');
const announcementRoutes = require('./modules/announcements/announcements.routes');
const userRoutes = require('./modules/users/users.routes');
const reportRoutes = require('./modules/reports/reports.routes');
const systemRoutes = require('./modules/system/system.routes');
const importRoutes = require('./modules/import/import.routes');

const app = express();

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet());

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (file://, Postman, curl, same-origin)
      if (!origin) return callback(null, true);
      // Exact match from env list
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Allow any localhost origin regardless of port (development)
      if (/^http:\/\/localhost(:\d+)?$/.test(origin)) return callback(null, true);
      if (/^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) return callback(null, true);
      // Allow any Vercel preview/production deployment
      if (/^https:\/\/.*\.vercel\.app$/.test(origin)) return callback(null, true);
      // Allow GitHub Pages
      if (/^https:\/\/.*\.github\.io$/.test(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many login attempts, please try again later.' },
});

app.use(globalLimiter);

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Static Files ─────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ─── Logging ──────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'EDU-SPHERE API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
const API = '/api/v1';

app.use(`${API}/auth`, authLimiter, authRoutes);
app.use(`${API}/students`, studentRoutes);
app.use(`${API}/teachers`, teacherRoutes);
app.use(`${API}/classes`, classRoutes);
app.use(`${API}/subjects`, subjectRoutes);
app.use(`${API}/timetable`, timetableRoutes);
app.use(`${API}/attendance`, attendanceRoutes);
app.use(`${API}/exams`, examRoutes);
app.use(`${API}/results`, resultRoutes);
app.use(`${API}/fees`, feeRoutes);
app.use(`${API}/accounts`, accountRoutes);
app.use(`${API}/library`, libraryRoutes);
app.use(`${API}/announcements`, announcementRoutes);
app.use(`${API}/users`, userRoutes);
app.use(`${API}/reports`, reportRoutes);
app.use(`${API}/system`, systemRoutes);
app.use(`${API}/import`, importRoutes);

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
