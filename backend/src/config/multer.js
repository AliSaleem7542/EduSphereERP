const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
const MAX_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB) || 5;
const MAX_IMPORT_SIZE_MB = parseInt(process.env.MAX_IMPORT_SIZE_MB) || 10;

// Ensure upload directories exist
const dirs = ['photos', 'imports'];
dirs.forEach((dir) => {
  const fullPath = path.join(process.cwd(), UPLOAD_DIR, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// ─── Security: MIME Type Validation ───────────────────────────────────────────
const ALLOWED_IMAGE_MIMES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

const ALLOWED_IMPORT_MIMES = {
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls'],
  'text/csv': ['.csv'],
  'application/csv': ['.csv'],
};

/**
 * Sanitize filename to prevent path traversal attacks
 */
function sanitizeFilename(filename) {
  if (!filename) return 'file';
  
  // Remove path separators and dangerous characters
  let sanitized = filename.replace(/[\/\\?%*:|"<>]/g, '');
  
  // Remove leading dots (hidden files)
  sanitized = sanitized.replace(/^\.+/, '');
  
  // Limit length
  if (sanitized.length > 255) {
    sanitized = sanitized.substring(0, 255);
  }
  
  return sanitized || 'file';
}

/**
 * Validate file extension matches MIME type
 */
function isValidMimeExtension(mimetype, extension, allowedMimes) {
  const allowedExtensions = allowedMimes[mimetype];
  if (!allowedExtensions) return false;
  return allowedExtensions.includes(extension.toLowerCase());
}

// ─── Photo Storage ────────────────────────────────────────────────────────────
const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), UPLOAD_DIR, 'photos'));
  },
  filename: (req, file, cb) => {
    // Sanitize original filename
    const sanitized = sanitizeFilename(file.originalname);
    const ext = path.extname(sanitized).toLowerCase();
    
    // Generate secure random filename
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});

const photoFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  // Validate MIME type is allowed
  if (!ALLOWED_IMAGE_MIMES[mimetype]) {
    return cb(new Error('Invalid file type. Only JPG, PNG, and WEBP images are allowed'), false);
  }

  // Validate extension matches MIME type (prevent double-extension attacks)
  if (!isValidMimeExtension(mimetype, ext, ALLOWED_IMAGE_MIMES)) {
    return cb(new Error('File extension does not match file type'), false);
  }

  cb(null, true);
};

const uploadPhoto = multer({
  storage: photoStorage,
  fileFilter: photoFilter,
  limits: { 
    fileSize: MAX_SIZE_MB * 1024 * 1024,
    files: 1, // Only allow single file upload
  },
});

// ─── Excel/CSV Import Storage ─────────────────────────────────────────────────
const importStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), UPLOAD_DIR, 'imports'));
  },
  filename: (req, file, cb) => {
    // Sanitize original filename
    const sanitized = sanitizeFilename(file.originalname);
    const ext = path.extname(sanitized).toLowerCase();
    
    // Generate secure filename
    const name = `import-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, name);
  },
});

const importFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  // Validate MIME type is allowed
  if (!ALLOWED_IMPORT_MIMES[mimetype]) {
    return cb(new Error('Invalid file type. Only Excel (.xlsx, .xls) and CSV files are allowed'), false);
  }

  // Validate extension matches MIME type (prevent double-extension attacks)
  if (!isValidMimeExtension(mimetype, ext, ALLOWED_IMPORT_MIMES)) {
    return cb(new Error('File extension does not match file type'), false);
  }

  cb(null, true);
};

const uploadImport = multer({
  storage: importStorage,
  fileFilter: importFilter,
  limits: { 
    fileSize: MAX_IMPORT_SIZE_MB * 1024 * 1024,
    files: 1, // Only allow single file upload
  },
});

module.exports = { uploadPhoto, uploadImport };
