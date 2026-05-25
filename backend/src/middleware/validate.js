const { sendError } = require('../utils/apiResponse');

/**
 * Middleware factory: validate request body against a Zod schema
 * @param {import('zod').ZodSchema} schema
 * @returns {Function} Express middleware
 *
 * Usage:
 *   router.post('/route', validate(myZodSchema), handler)
 */
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return sendError(res, 'Validation failed', 422, errors);
    }

    // Replace req.body with the parsed (and coerced) data
    req.body = result.data;
    next();
  };
}

/**
 * Middleware factory: validate query params against a Zod schema
 */
function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return sendError(res, 'Invalid query parameters', 422, errors);
    }

    req.query = result.data;
    next();
  };
}

module.exports = { validate, validateQuery };
