/**
 * EDU-SPHERE — Data Formatters
 * Utility functions for formatting dates, currency, phone numbers, etc.
 * @version 1.0.0
 */

var Formatters = (function() {
  
  /**
   * Format date to readable string
   * @param {string|Date} date - Date to format
   * @param {string} format - Format type: 'short', 'long', 'time', 'datetime'
   * @returns {string} Formatted date
   */
  function formatDate(date, format) {
    if (!date) {
      return '-';
    }
    
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return '-';
    }
    
    format = format || 'short';
    
    const options = {
      short: { year: 'numeric', month: '2-digit', day: '2-digit' },
      long: { year: 'numeric', month: 'long', day: 'numeric' },
      time: { hour: '2-digit', minute: '2-digit', hour12: true },
      datetime: { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit',
      },
    };
    
    try {
      return d.toLocaleString('en-US', options[format] || options.short);
    } catch (err) {
      return d.toLocaleDateString();
    }
  }
  
  /**
   * Format currency (PKR)
   * @param {number} amount - Amount to format
   * @param {boolean} showSymbol - Show Rs. symbol
   * @returns {string} Formatted currency
   */
  function formatCurrency(amount, showSymbol) {
    showSymbol = showSymbol !== false;
    
    if (amount === null || amount === undefined || isNaN(amount)) {
      return showSymbol ? 'Rs. 0' : '0';
    }
    
    const formatted = parseFloat(amount).toLocaleString('en-PK', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    
    return showSymbol ? 'Rs. ' + formatted : formatted;
  }
  
  /**
   * Format phone number (Pakistan format)
   * @param {string} phone - Phone number
   * @returns {string} Formatted phone
   */
  function formatPhone(phone) {
    if (!phone) {
      return '-';
    }
    
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');
    
    // Format based on length
    if (cleaned.length === 11) {
      // 03XX-XXXXXXX
      return cleaned.replace(/(\d{4})(\d{7})/, '$1-$2');
    } else if (cleaned.length === 10) {
      // 3XX-XXXXXXX
      return cleaned.replace(/(\d{3})(\d{7})/, '$1-$2');
    }
    
    return phone;
  }
  
  /**
   * Format CNIC (Pakistan)
   * @param {string} cnic - CNIC number
   * @returns {string} Formatted CNIC
   */
  function formatCNIC(cnic) {
    if (!cnic) {
      return '-';
    }
    
    const cleaned = cnic.replace(/\D/g, '');
    
    if (cleaned.length === 13) {
      return cleaned.replace(/(\d{5})(\d{7})(\d{1})/, '$1-$2-$1');
    }
    
    return cnic;
  }
  
  /**
   * Format percentage
   * @param {number} value - Value to format
   * @param {number} decimals - Decimal places (default: 1)
   * @returns {string} Formatted percentage
   */
  function formatPercentage(value, decimals) {
    decimals = decimals !== undefined ? decimals : 1;
    
    if (value === null || value === undefined || isNaN(value)) {
      return '0%';
    }
    
    return parseFloat(value).toFixed(decimals) + '%';
  }
  
  /**
   * Format file size
   * @param {number} bytes - Size in bytes
   * @returns {string} Formatted size
   */
  function formatFileSize(bytes) {
    if (!bytes || bytes === 0) {
      return '0 Bytes';
    }
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  /**
   * Truncate text with ellipsis
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length
   * @returns {string} Truncated text
   */
  function truncate(text, maxLength) {
    if (!text) {
      return '';
    }
    
    maxLength = maxLength || 50;
    
    if (text.length <= maxLength) {
      return text;
    }
    
    return text.substring(0, maxLength - 3) + '...';
  }
  
  /**
   * Capitalize first letter of each word
   * @param {string} text - Text to capitalize
   * @returns {string} Capitalized text
   */
  function capitalize(text) {
    if (!text) {
      return '';
    }
    
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  /**
   * Format class name (e.g., "Class 10-A")
   * @param {number} classNum - Class number
   * @param {string} section - Section letter
   * @returns {string} Formatted class name
   */
  function formatClassName(classNum, section) {
    if (!classNum) {
      return '-';
    }
    
    let formatted = 'Class ' + classNum;
    
    if (section) {
      formatted += '-' + section.toUpperCase();
    }
    
    return formatted;
  }
  
  /**
   * Format roll number
   * @param {number} rollNo - Roll number
   * @param {number} minDigits - Minimum digits (default: 3)
   * @returns {string} Formatted roll number
   */
  function formatRollNumber(rollNo, minDigits) {
    if (!rollNo) {
      return '-';
    }
    
    minDigits = minDigits || 3;
    return String(rollNo).padStart(minDigits, '0');
  }
  
  /**
   * Format relative time (e.g., "2 hours ago")
   * @param {string|Date} date - Date to format
   * @returns {string} Relative time string
   */
  function formatRelativeTime(date) {
    if (!date) {
      return '-';
    }
    
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return '-';
    }
    
    const now = new Date();
    const diffMs = now - d;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSecs < 60) {
      return 'Just now';
    } else if (diffMins < 60) {
      return diffMins + ' minute' + (diffMins !== 1 ? 's' : '') + ' ago';
    } else if (diffHours < 24) {
      return diffHours + ' hour' + (diffHours !== 1 ? 's' : '') + ' ago';
    } else if (diffDays < 7) {
      return diffDays + ' day' + (diffDays !== 1 ? 's' : '') + ' ago';
    } else {
      return formatDate(d, 'short');
    }
  }
  
  /**
   * Format grade/marks
   * @param {number} marks - Obtained marks
   * @param {number} total - Total marks
   * @returns {string} Formatted grade
   */
  function formatGrade(marks, total) {
    if (marks === null || marks === undefined || !total) {
      return '-';
    }
    
    const percentage = (marks / total) * 100;
    
    return marks + '/' + total + ' (' + percentage.toFixed(1) + '%)';
  }
  
  /**
   * Get grade letter from percentage
   * @param {number} percentage - Percentage score
   * @returns {string} Grade letter (A+, A, B, etc.)
   */
  function getGradeLetter(percentage) {
    if (percentage === null || percentage === undefined || isNaN(percentage)) {
      return '-';
    }
    
    if (percentage >= 90) {
      return 'A+';
    } else if (percentage >= 80) {
      return 'A';
    } else if (percentage >= 70) {
      return 'B';
    } else if (percentage >= 60) {
      return 'C';
    } else if (percentage >= 50) {
      return 'D';
    } else if (percentage >= 40) {
      return 'E';
    } else {
      return 'F';
    }
  }
  
  /**
   * Format gender
   * @param {string} gender - Gender code (M/F/O)
   * @returns {string} Formatted gender
   */
  function formatGender(gender) {
    if (!gender) {
      return '-';
    }
    
    const genders = {
      'M': 'Male',
      'F': 'Female',
      'O': 'Other',
      'MALE': 'Male',
      'FEMALE': 'Female',
      'OTHER': 'Other',
    };
    
    return genders[gender.toUpperCase()] || gender;
  }
  
  /**
   * Format status badge
   * @param {string} status - Status text
   * @returns {string} HTML badge
   */
  function formatStatusBadge(status) {
    if (!status) {
      return '';
    }
    
    const statusMap = {
      'ACTIVE': { class: 'success', text: 'Active' },
      'INACTIVE': { class: 'danger', text: 'Inactive' },
      'PENDING': { class: 'warning', text: 'Pending' },
      'SUSPENDED': { class: 'danger', text: 'Suspended' },
      'APPROVED': { class: 'success', text: 'Approved' },
      'REJECTED': { class: 'danger', text: 'Rejected' },
      'PAID': { class: 'success', text: 'Paid' },
      'UNPAID': { class: 'danger', text: 'Unpaid' },
      'PARTIAL': { class: 'warning', text: 'Partial' },
    };
    
    const statusData = statusMap[status.toUpperCase()] || { class: 'secondary', text: status };
    
    return '<span class="badge bg-' + statusData.class + '">' + 
           SECURITY.escapeHtml(statusData.text) + 
           '</span>';
  }
  
  // Public API
  return {
    formatDate: formatDate,
    formatCurrency: formatCurrency,
    formatPhone: formatPhone,
    formatCNIC: formatCNIC,
    formatPercentage: formatPercentage,
    formatFileSize: formatFileSize,
    truncate: truncate,
    capitalize: capitalize,
    formatClassName: formatClassName,
    formatRollNumber: formatRollNumber,
    formatRelativeTime: formatRelativeTime,
    formatGrade: formatGrade,
    getGradeLetter: getGradeLetter,
    formatGender: formatGender,
    formatStatusBadge: formatStatusBadge,
  };
  
})();

// Make it available globally
if (typeof window !== 'undefined') {
  window.Formatters = Formatters;
}
