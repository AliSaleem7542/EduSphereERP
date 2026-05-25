const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
const MAX_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB) || 5;

// Ensure upload directories exist
const dirs = ['photos', 'imports'];
dirs.forEach((dir) => {
  const fullPath = path.join(process.cwd(), UPLOAD_DIR, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// ─── Photo Storage ────────────────────────────────────────────────────────────
const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), UPLOAD_DIR, 'photos'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, name);
  },
});

const photoFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, and WEBP images are allowed'), false);
  }
};

const uploadPhoto = multer({
  storage: photoStorage,
  fileFilter: photoFilter,
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
});

// ─── Excel/CSV Import Storage ─────────────────────────────────────────────────
const importStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), UPLOAD_DIR, 'imports'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `import-${Date.now()}${ext}`);
  },
});

const importFilter = (req, file, cb) => {
  const allowed = ['.xlsx', '.xls', '.csv'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only Excel (.xlsx, .xls) and CSV files are allowed'), false);
  }
};

const uploadImport = multer({
  storage: importStorage,
  fileFilter: importFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB for imports
});

module.exports = { uploadPhoto, uploadImport };
