/**
 * EDU-SPHERE — Form Validators
 * Reusable validation functions for forms
 * @version 1.0.0
 */

var Validators = (function() {
  
  /**
   * Validate required field
   * @param {string} value - Field value
   * @param {string} fieldName - Field name for error message
   * @returns {object} { valid: boolean, error: string }
   */
  function required(value, fieldName) {
    fieldName = fieldName || 'This field';
    
    if (!value || value.toString().trim() === '') {
      return { valid: false, error: fieldName + ' is required' };
    }
    
    return { valid: true, error: null };
  }
  
  /**
   * Validate email format
   * @param {string} email - Email address
   * @returns {object} { valid: boolean, error: string }
   */
  function email(email) {
    if (!email) {
      return { valid: false, error: 'Email is required' };
    }
    
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!regex.test(email)) {
      return { valid: false, error: 'Invalid email format' };
    }
    
    return { valid: true, error: null };
  }
  
  /**
   * Validate phone number (Pakistan)
   * @param {string} phone - Phone number
   * @returns {object} { valid: boolean, error: string }
   */
  function phone(phone) {
    if (!phone) {
      return { valid: false, error: 'Phone number is required' };
    }
    
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length < 10 || cleaned.length > 11) {
      return { valid: false, error: 'Phone must be 10-11 digits' };
    }
    
    if (cleaned.length === 11 && !cleaned.startsWith('03')) {
      return { valid: false, error: 'Mobile number must start with 03' };
    }
    
    return { valid: true, error: null };
  }
  
  /**
   * Validate CNIC (Pakistan)
   * @param {string} cnic - CNIC number
   * @returns {object} { valid: boolean, error: string }
   */
  function cnic(cnic) {
    if (!cnic) {
      return { valid: false, error: 'CNIC is required' };
    }
    
    const cleaned = cnic.replace(/\D/g, '');
    
    if (cleaned.length !== 13) {
      return { valid: false, error: 'CNIC must be 13 digits' };
    }
    
    return { valid: true, error: null };
  }
  
  /**
   * Validate minimum length
   * @param {string} value - Value to validate
   * @param {number} minLength - Minimum length
   * @param {string} fieldName - Field name
   * @returns {object} { valid: boolean, error: string }
   */
  function minLength(value, minLength, fieldName) {
    fieldName = fieldName || 'This field';
    
    if (!value || value.length < minLength) {
      return { 
        valid: false, 
        error: fieldName + ' must be at least ' + minLength + ' characters',
      };
    }
    
    return { valid: true, error: null };
  }
  
  /**
   * Validate maximum length
   * @param {string} value - Value to validate
   * @param {number} maxLength - Maximum length
   * @param {string} fieldName - Field name
   * @returns {object} { valid: boolean, error: string }
   */
  function maxLength(value, maxLength, fieldName) {
    fieldName = fieldName || 'This field';
    
    if (value && value.length > maxLength) {
      return { 
        valid: false, 
        error: fieldName + ' must not exceed ' + maxLength + ' characters',
      };
    }
    
    return { valid: true, error: null };
  }
  
  /**
   * Validate numeric value
   * @param {string|number} value - Value to validate
   * @param {string} fieldName - Field name
   * @returns {object} { valid: boolean, error: string }
   */
  function numeric(value, fieldName) {
    fieldName = fieldName || 'This field';
    
    if (value === null || value === undefined || value === '') {
      return { valid: false, error: fieldName + ' is required' };
    }
    
    if (isNaN(value)) {
      return { valid: false, error: fieldName + ' must be a number' };
    }
    
    return { valid: true, error: null };
  }
  
  /**
   * Validate number range
   * @param {number} value - Value to validate
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @param {string} fieldName - Field name
   * @returns {object} { valid: boolean, error: string }
   */
  function range(value, min, max, fieldName) {
    fieldName = fieldName || 'This field';
    
    const numValue = parseFloat(value);
    
    if (isNaN(numValue)) {
      return { valid: false, error: fieldName + ' must be a number' };
    }
    
    if (numValue < min || numValue > max) {
      return { 
        valid: false, 
        error: fieldName + ' must be between ' + min + ' and ' + max,
      };
    }
    
    return { valid: true, error: null };
  }
  
  /**
   * Validate date format (YYYY-MM-DD)
   * @param {string} date - Date string
   * @returns {object} { valid: boolean, error: string }
   */
  function date(date) {
    if (!date) {
      return { valid: false, error: 'Date is required' };
    }
    
    const d = new Date(date);
    
    if (isNaN(d.getTime())) {
      return { valid: false, error: 'Invalid date format' };
    }
    
    return { valid: true, error: null };
  }
  
  /**
   * Validate age from date of birth
   * @param {string} dob - Date of birth
   * @param {number} minAge - Minimum age
   * @param {number} maxAge - Maximum age
   * @returns {object} { valid: boolean, error: string }
   */
  function age(dob, minAge, maxAge) {
    if (!dob) {
      return { valid: false, error: 'Date of birth is required' };
    }
    
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) {
      return { valid: false, error: 'Invalid date of birth' };
    }
    
    const today = new Date();
    let ageYears = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      ageYears--;
    }
    
    if (minAge && ageYears < minAge) {
      return { valid: false, error: 'Age must be at least ' + minAge + ' years' };
    }
    
    if (maxAge && ageYears > maxAge) {
      return { valid: false, error: 'Age must not exceed ' + maxAge + ' years' };
    }
    
    return { valid: true, error: null };
  }
  
  /**
   * Validate password strength
   * @param {string} password - Password
   * @returns {object} { valid: boolean, error: string, strength: string }
   */
  function password(password) {
    if (!password) {
      return { valid: false, error: 'Password is required', strength: 'none' };
    }
    
    if (password.length < 8) {
      return { 
        valid: false, 
        error: 'Password must be at least 8 characters',
        strength: 'weak',
      };
    }
    
    let strength = 0;
    if (/[a-z]/.test(password)) { strength++; }
    if (/[A-Z]/.test(password)) { strength++; }
    if (/[0-9]/.test(password)) { strength++; }
    if (/[^a-zA-Z0-9]/.test(password)) { strength++; }
    
    const strengthMap = ['weak', 'weak', 'medium', 'strong', 'strong'];
    const strengthLabel = strengthMap[strength];
    
    if (strength < 3) {
      return { 
        valid: false, 
        error: 'Password must contain uppercase, lowercase, and numbers',
        strength: strengthLabel,
      };
    }
    
    return { valid: true, error: null, strength: strengthLabel };
  }
  
  /**
   * Validate file upload
   * @param {File} file - File object
   * @param {object} options - { maxSize, allowedTypes, allowedExtensions }
   * @returns {object} { valid: boolean, error: string }
   */
  function file(file, options) {
    options = options || {};
    
    if (!file) {
      return { valid: false, error: 'Please select a file' };
    }
    
    // Check file size
    if (options.maxSize && file.size > options.maxSize) {
      const maxSizeMB = (options.maxSize / (1024 * 1024)).toFixed(1);
      return { 
        valid: false, 
        error: 'File size must not exceed ' + maxSizeMB + ' MB',
      };
    }
    
    // Check file type
    if (options.allowedTypes && options.allowedTypes.length > 0) {
      if (!options.allowedTypes.includes(file.type)) {
        return { 
          valid: false, 
          error: 'Invalid file type. Allowed: ' + options.allowedTypes.join(', '),
        };
      }
    }
    
    // Check file extension
    if (options.allowedExtensions && options.allowedExtensions.length > 0) {
      const ext = file.name.split('.').pop().toLowerCase();
      if (!options.allowedExtensions.includes(ext)) {
        return { 
          valid: false, 
          error: 'Invalid file extension. Allowed: ' + options.allowedExtensions.join(', '),
        };
      }
    }
    
    return { valid: true, error: null };
  }
  
  /**
   * Validate form data
   * @param {object} data - Form data object
   * @param {object} rules - Validation rules
   * @returns {object} { valid: boolean, errors: object }
   */
  function validateForm(data, rules) {
    const errors = {};
    let isValid = true;
    
    for (const field in rules) {
      const fieldRules = rules[field];
      const value = data[field];
      
      for (const rule of fieldRules) {
        let result;
        
        if (rule.type === 'required') {
          result = required(value, rule.fieldName || field);
        } else if (rule.type === 'email') {
          result = email(value);
        } else if (rule.type === 'phone') {
          result = phone(value);
        } else if (rule.type === 'cnic') {
          result = cnic(value);
        } else if (rule.type === 'minLength') {
          result = minLength(value, rule.min, rule.fieldName || field);
        } else if (rule.type === 'maxLength') {
          result = maxLength(value, rule.max, rule.fieldName || field);
        } else if (rule.type === 'numeric') {
          result = numeric(value, rule.fieldName || field);
        } else if (rule.type === 'range') {
          result = range(value, rule.min, rule.max, rule.fieldName || field);
        } else if (rule.type === 'date') {
          result = date(value);
        } else if (rule.type === 'age') {
          result = age(value, rule.min, rule.max);
        } else if (rule.type === 'password') {
          result = password(value);
        } else if (rule.type === 'custom') {
          result = rule.validator(value);
        }
        
        if (result && !result.valid) {
          errors[field] = result.error;
          isValid = false;
          break;
        }
      }
    }
    
    return { valid: isValid, errors: errors };
  }
  
  /**
   * Show validation errors on form
   * @param {HTMLFormElement} form - Form element
   * @param {object} errors - Error messages object
   */
  function showFormErrors(form, errors) {
    // Clear previous errors
    const errorElements = form.querySelectorAll('.invalid-feedback, .is-invalid');
    errorElements.forEach(el => {
      if (el.classList.contains('invalid-feedback')) {
        el.remove();
      } else {
        el.classList.remove('is-invalid');
      }
    });
    
    // Show new errors
    for (const field in errors) {
      const input = form.querySelector('[name="' + field + '"]');
      if (input) {
        input.classList.add('is-invalid');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        errorDiv.textContent = errors[field];
        
        input.parentNode.appendChild(errorDiv);
      }
    }
  }
  
  /**
   * Clear form errors
   * @param {HTMLFormElement} form - Form element
   */
  function clearFormErrors(form) {
    const errorElements = form.querySelectorAll('.invalid-feedback, .is-invalid');
    errorElements.forEach(el => {
      if (el.classList.contains('invalid-feedback')) {
        el.remove();
      } else {
        el.classList.remove('is-invalid');
      }
    });
  }
  
  // Public API
  return {
    required: required,
    email: email,
    phone: phone,
    cnic: cnic,
    minLength: minLength,
    maxLength: maxLength,
    numeric: numeric,
    range: range,
    date: date,
    age: age,
    password: password,
    file: file,
    validateForm: validateForm,
    showFormErrors: showFormErrors,
    clearFormErrors: clearFormErrors,
  };
  
})();

// Make it available globally
if (typeof window !== 'undefined') {
  window.Validators = Validators;
}
