/**
 * Send a standardised success response
 */
function sendSuccess(res, data = null, message = 'Success', statusCode = 200) {
  const body = { success: true, message };
  if (data !== null) body.data = data;
  return res.status(statusCode).json(body);
}

/**
 * Send a standardised error response
 */
function sendError(res, message = 'An error occurred', statusCode = 500, errors = null) {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
}

/**
 * Build a paginated response wrapper
 */
function paginate(data, total, page, limit) {
  return {
    data,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
}

module.exports = { sendSuccess, sendError, paginate };
