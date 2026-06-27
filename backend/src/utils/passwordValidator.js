/**
 * Password Security Validator
 * Enforces strong password policy according to security best practices
 */

const MIN_LENGTH = 8;
const MAX_LENGTH = 128;

// Common weak passwords to reject
const WEAK_PASSWORDS = [
  'password', 'password123', '12345678', 'qwerty', 'abc123', 'password1',
  'admin', 'admin123', 'letmein', 'welcome', 'monkey', 'dragon', 'master',
  '123456', '1234567', '123456789', 'qwerty123', 'pass123', 'test123',
];

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} { valid: boolean, errors: string[] }
 */
function validatePassword(password) {
  const errors = [];

  // Check if password exists
  if (!password || typeof password !== 'string') {
    return { valid: false, errors: ['Password is required'] };
  }

  // Check minimum length
  if (password.length < MIN_LENGTH) {
    errors.push(`Password must be at least ${MIN_LENGTH} characters long`);
  }

  // Check maximum length (prevent DoS)
  if (password.length > MAX_LENGTH) {
    errors.push(`Password must not exceed ${MAX_LENGTH} characters`);
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // Check for number
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Check for special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&* etc.)');
  }

  // Check against common weak passwords
  if (WEAK_PASSWORDS.includes(password.toLowerCase())) {
    errors.push('This password is too common and easily guessable');
  }

  // Check for sequential characters (123, abc, etc.)
  if (/012|123|234|345|456|567|678|789|890/.test(password) ||
      /abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i.test(password)) {
    errors.push('Password should not contain sequential characters');
  }

  // Check for repeated characters (aaa, 111, etc.)
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Password should not contain repeated characters (aaa, 111, etc.)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Quick check if password meets minimum requirements
 * @param {string} password
 * @returns {boolean}
 */
function isStrongPassword(password) {
  const result = validatePassword(password);
  return result.valid;
}

/**
 * Get password strength score (0-100)
 * @param {string} password
 * @returns {number} Score from 0-100
 */
function getPasswordStrength(password) {
  let score = 0;

  if (!password) return 0;

  // Length bonus
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;

  // Character variety
  if (/[a-z]/.test(password)) score += 15;
  if (/[A-Z]/.test(password)) score += 15;
  if (/[0-9]/.test(password)) score += 15;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 15;

  // Penalty for common patterns
  if (WEAK_PASSWORDS.includes(password.toLowerCase())) score -= 50;
  if (/012|123|234/.test(password)) score -= 10;
  if (/(.)\1{2,}/.test(password)) score -= 10;

  return Math.max(0, Math.min(100, score));
}

/**
 * Get human-readable password strength label
 * @param {string} password
 * @returns {string} 'Weak', 'Fair', 'Good', or 'Strong'
 */
function getPasswordStrengthLabel(password) {
  const score = getPasswordStrength(password);
  if (score < 40) return 'Weak';
  if (score < 60) return 'Fair';
  if (score < 80) return 'Good';
  return 'Strong';
}

module.exports = {
  validatePassword,
  isStrongPassword,
  getPasswordStrength,
  getPasswordStrengthLabel,
  MIN_LENGTH,
  MAX_LENGTH,
};
