const { sendError } = require('../utils/apiResponse');

/**
 * Middleware factory: restrict access to specific roles
 * @param {...string} roles - allowed roles e.g. 'ADMIN', 'TEACHER'
 * @returns {Function} Express middleware
 *
 * Usage:
 *   router.get('/route', authenticate, authorize('ADMIN'), handler)
 *   router.get('/route', authenticate, authorize('ADMIN', 'TEACHER'), handler)
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Required role(s): ${roles.join(', ')}`,
        403
      );
    }

    next();
  };
}

module.exports = { authorize };
