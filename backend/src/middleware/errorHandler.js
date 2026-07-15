const { Prisma } = require('@prisma/client');

/**
 * Global Express error handler
 * Must be registered LAST in app.js
 */
function errorHandler(err, req, res, next) {
  // Log in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('❌ Error:', err);
  }

  // ─── Prisma Errors ──────────────────────────────────────────────────────────
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        const field = err.meta?.target?.[0] || 'field';
        return res.status(409).json({
          success: false,
          message: `A record with this ${field} already exists`,
        });
      }
      case 'P2025':
        return res.status(404).json({
          success: false,
          message: 'Record not found',
        });
      case 'P2003':
        return res.status(400).json({
          success: false,
          message: 'Related record not found (foreign key constraint)',
        });
      default:
        console.error('[PRISMA] Unhandled error code:', err.code, err.message);
        return res.status(400).json({
          success: false,
          message: 'Database error: ' + err.code,
          code: err.code,
        });
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    // Log the full validation error for server-side debugging
    console.error('❌ PrismaClientValidationError:', err.message);
    console.error('❌ Full error stack:', err.stack);
    
    // Extract field names from error message if possible
    const fieldMatch = err.message.match(/Argument `(\w+)`.+?(\w+)/);
    const missingFieldMatch = err.message.match(/required.+?`(\w+)`/i);
    
    let userMessage = 'Invalid data provided to database';
    if (missingFieldMatch) {
      userMessage = `Missing required field: ${missingFieldMatch[1]}`;
    } else if (fieldMatch) {
      userMessage = `Invalid value for field: ${fieldMatch[1]}`;
    }
    
    return res.status(400).json({
      success: false,
      message: userMessage,
      debug: process.env.NODE_ENV !== 'production' ? err.message.substring(0, 500) : undefined,
    });
  }

  // ─── JWT Errors ─────────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired' });
  }

  // ─── Multer Errors ───────────────────────────────────────────────────────────
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: `File too large. Maximum size is ${process.env.MAX_FILE_SIZE_MB || 5}MB`,
    });
  }

  // ─── CORS Errors ─────────────────────────────────────────────────────────────
  if (err.message && err.message.startsWith('CORS:')) {
    return res.status(403).json({ success: false, message: err.message });
  }

  // ─── Generic / Operational Errors ────────────────────────────────────────────
  const statusCode = err.statusCode || err.status || 500;
  const message =
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Internal server error'
      : err.message || 'Internal server error';

  // Always log errors in production for Render log visibility
  console.error(`[ERROR] ${statusCode} — ${message}`);

  return res.status(statusCode).json({ success: false, message });
}

module.exports = { errorHandler };
