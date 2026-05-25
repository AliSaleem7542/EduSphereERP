const { verifyAccessToken } = require('../config/jwt');
const { sendError } = require('../utils/apiResponse');

/**
 * Middleware: verify JWT access token and attach req.user
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Access token required', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = {
      id: decoded.id,
      role: decoded.role,
      username: decoded.username,
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 'Access token expired', 401);
    }
    return sendError(res, 'Invalid access token', 401);
  }
}

module.exports = { authenticate };
