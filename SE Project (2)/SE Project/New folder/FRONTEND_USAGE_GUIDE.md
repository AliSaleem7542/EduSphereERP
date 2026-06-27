# 📘 EDU-SPHERE Frontend — Usage Guide

**Version:** 3.0.0  
**Last Updated:** June 27, 2026  
**Status:** ✅ Phase 2 Complete

---

## 📚 Table of Contents

1. [Quick Start](#quick-start)
2. [Layout Components](#layout-components)
3. [Utility Functions](#utility-functions)
4. [Form Validation](#form-validation)
5. [Data Formatting](#data-formatting)
6. [Logging](#logging)
7. [Security Best Practices](#security-best-practices)
8. [Build & Deploy](#build--deploy)
9. [Code Examples](#code-examples)

---

## 🚀 Quick Start

### Installation

```bash
# Navigate to frontend directory
cd "SE Project (2)/SE Project/New folder"

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### Creating a New Page

1. **Copy the template structure:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Page Title | EDU-SPHERE</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- CSS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/source-sans-3@5.0.12/index.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css">
  <link rel="stylesheet" href="css/adminlte.css">
  
  <!-- Core Scripts -->
  <script src="js/config.js" defer></script>
  <script src="js/security.js" defer></script>
  <script src="js/auth.js" defer></script>
  <script src="js/api.js" defer></script>
  
  <!-- Utility Scripts -->
  <script src="js/utils/logger.js" defer></script>
  <script src="js/utils/formatters.js" defer></script>
  <script src="js/utils/validators.js" defer></script>
  
  <!-- Components -->
  <script src="js/components/layout.js" defer></script>
</head>
<body class="layout-fixed sidebar-expand-lg">
  <div class="app-wrapper">
    
    <!-- Header (will be injected by Layout.js) -->
    <nav class="main-header"></nav>
    
    <!-- Sidebar (will be injected by Layout.js) -->
    <aside class="main-sidebar"></aside>
    
    <!-- Main Content -->
    <main class="app-main">
      <div class="app-content-header">
        <div class="container-fluid">
          <div class="row">
            <div class="col-sm-6">
              <h3 class="mb-0">Page Title</h3>
            </div>
          </div>
        </div>
      </div>
      
      <div class="app-content">
        <div class="container-fluid">
          <!-- Your content here -->
        </div>
      </div>
    </main>
    
    <!-- Footer (will be injected by Layout.js) -->
    <footer class="main-footer"></footer>
    
  </div>
  
  <!-- Page-specific script -->
  <script src="js/pages/your-page.js" defer></script>
  
  <script>
    // Initialize layout when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
      // Initialize layout components
      Layout.init({
        title: 'Page Title',
        activeMenu: 'menu-id',
        showNotifications: true
      });
      
      // Your page initialization here
      initPage();
    });
  </script>
</body>
</html>
```

---

## 🎨 Layout Components

### Layout.init()

**One-line page initialization** — Renders header, sidebar, and footer.

```javascript
// Initialize with all options
Layout.init({
  title: 'Manage Students',           // Page title in header
  activeMenu: 'students-list',        // Active menu item ID
  showNotifications: true             // Show notification icon (default: true)
});

// Minimal initialization
Layout.init({ title: 'Dashboard', activeMenu: 'dashboard' });
```

### Individual Component Methods

```javascript
// Render only header
Layout.renderHeader({ 
  title: 'Dashboard',
  showNotifications: true 
});

// Render only sidebar
Layout.renderSidebar('dashboard'); // Pass active menu ID

// Render only footer
Layout.renderFooter();
```

### Menu Item IDs by Role

**ADMIN:**
- `dashboard`, `students`, `students-list`, `students-add`, `students-import`, `students-promote`
- `teachers`, `teachers-list`, `teachers-add`, `teachers-schedule`
- `academics`, `classes`, `timetable`, `exams`, `results`
- `attendance`, `attendance-student`, `attendance-teacher`, `attendance-reports`
- `fees`, `fees-collect`, `fees-records`, `fees-pending`, `fees-refunds`
- `accounts`, `accounts-entry`, `accounts-ledger`, `accounts-balance`
- `library`, `library-books`, `library-issue`, `library-return`
- `announcements`, `reports`, `settings`

**TEACHER:**
- `dashboard`, `my-schedule`, `my-students`, `mark-attendance`
- `enter-results`, `exams`, `announcements`, `profile`

**STUDENT:**
- `dashboard`, `profile`, `timetable`, `attendance`, `exams`
- `results`, `fees`, `library`, `announcements`

**CASHIER:**
- `dashboard`, `collect-fee`, `fee-records`, `pending-fees`, `refunds`

**LIBRARIAN:**
- `dashboard`, `books`, `issue`, `return`

---

## 🛠️ Utility Functions

### Formatters

```javascript
// Date formatting
Formatters.formatDate('2026-06-27', 'short');      // "06/27/2026"
Formatters.formatDate('2026-06-27', 'long');       // "June 27, 2026"
Formatters.formatDate('2026-06-27', 'datetime');   // "Jun 27, 2026, 03:30 PM"
Formatters.formatRelativeTime('2026-06-27');       // "2 hours ago"

// Currency formatting
Formatters.formatCurrency(5000);                   // "Rs. 5,000"
Formatters.formatCurrency(5000.50, false);         // "5,000.50"

// Phone & CNIC formatting
Formatters.formatPhone('03001234567');             // "0300-1234567"
Formatters.formatCNIC('3520212345671');            // "35202-1234567-1"

// Percentage & file size
Formatters.formatPercentage(85.5);                 // "85.5%"
Formatters.formatFileSize(1024000);                // "1000 KB"

// Text formatting
Formatters.truncate('Long text here', 10);         // "Long te..."
Formatters.capitalize('john doe');                 // "John Doe"

// Education-specific
Formatters.formatClassName(10, 'A');               // "Class 10-A"
Formatters.formatRollNumber(5);                    // "005"
Formatters.formatGrade(85, 100);                   // "85/100 (85.0%)"
Formatters.getGradeLetter(85);                     // "A"
Formatters.formatGender('M');                      // "Male"

// Status badge
Formatters.formatStatusBadge('ACTIVE');            // <span class="badge bg-success">Active</span>
```

### Validators

```javascript
// Basic validation
Validators.required('value', 'Username');          // { valid: true, error: null }
Validators.email('test@example.com');              // { valid: true, error: null }
Validators.phone('03001234567');                   // { valid: true, error: null }
Validators.cnic('3520212345671');                  // { valid: true, error: null }

// Length validation
Validators.minLength('text', 5, 'Name');           // { valid: false, error: "..." }
Validators.maxLength('text', 100, 'Description');  // { valid: true, error: null }

// Numeric validation
Validators.numeric('123', 'Age');                  // { valid: true, error: null }
Validators.range(25, 18, 100, 'Age');              // { valid: true, error: null }

// Date & age validation
Validators.date('2026-06-27');                     // { valid: true, error: null }
Validators.age('2010-01-01', 5, 18);               // Check age between 5-18 years

// Password validation
Validators.password('MyPass123!');                 // { valid: true, error: null, strength: 'strong' }

// File validation
const fileInput = document.querySelector('#photo');
Validators.file(fileInput.files[0], {
  maxSize: 5 * 1024 * 1024,                        // 5 MB
  allowedTypes: ['image/jpeg', 'image/png'],
  allowedExtensions: ['jpg', 'jpeg', 'png']
});
```

### Form Validation

```javascript
// Define validation rules
const validationRules = {
  name: [
    { type: 'required', fieldName: 'Student Name' },
    { type: 'minLength', min: 3, fieldName: 'Student Name' }
  ],
  email: [
    { type: 'required', fieldName: 'Email' },
    { type: 'email' }
  ],
  phone: [
    { type: 'required', fieldName: 'Phone' },
    { type: 'phone' }
  ],
  age: [
    { type: 'required', fieldName: 'Age' },
    { type: 'numeric', fieldName: 'Age' },
    { type: 'range', min: 5, max: 18, fieldName: 'Age' }
  ],
  password: [
    { type: 'password' }
  ],
  custom_field: [
    { 
      type: 'custom',
      validator: function(value) {
        // Custom validation logic
        if (value !== 'expected') {
          return { valid: false, error: 'Invalid value' };
        }
        return { valid: true, error: null };
      }
    }
  ]
};

// Validate form
const formData = {
  name: 'John Doe',
  email: 'john@example.com',
  phone: '03001234567',
  age: 16
};

const result = Validators.validateForm(formData, validationRules);

if (result.valid) {
  // Form is valid, submit data
  submitForm(formData);
} else {
  // Show errors
  Validators.showFormErrors(document.querySelector('#myForm'), result.errors);
}

// Clear errors
Validators.clearFormErrors(document.querySelector('#myForm'));
```

---

## 📊 Data Formatting

### Complete Example: Student Table

```javascript
function renderStudentTable(students) {
  const tbody = document.querySelector('#studentTable tbody');
  tbody.innerHTML = '';
  
  students.forEach(student => {
    const row = document.createElement('tr');
    
    row.innerHTML = `
      <td>${SECURITY.escapeHtml(student.name)}</td>
      <td>${Formatters.formatClassName(student.class, student.section)}</td>
      <td>${Formatters.formatRollNumber(student.rollNo)}</td>
      <td>${Formatters.formatPhone(student.phone)}</td>
      <td>${Formatters.formatGender(student.gender)}</td>
      <td>${Formatters.formatDate(student.admissionDate, 'short')}</td>
      <td>${Formatters.formatStatusBadge(student.status)}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="viewStudent(${student.id})">
          <i class="bi bi-eye"></i>
        </button>
        <button class="btn btn-sm btn-warning" onclick="editStudent(${student.id})">
          <i class="bi bi-pencil"></i>
        </button>
      </td>
    `;
    
    tbody.appendChild(row);
  });
}
```

---

## 🔍 Logging

### Basic Logging

```javascript
// Debug (development only)
Logger.debug('Loading students...', { page: 1, limit: 10 });

// Info
Logger.info('Student created successfully', studentData);

// Warning
Logger.warn('API rate limit approaching');

// Error (always shown)
Logger.error('Failed to load students:', error);
```

### Advanced Logging

```javascript
// Grouped logs
Logger.group('Student Form Submission', function() {
  Logger.debug('Validating form...');
  Logger.debug('Form data:', formData);
  Logger.info('Submitting to API...');
});

// Table view
Logger.table(students, 'All Students');

// Performance timing
Logger.time('API Call');
// ... perform API call ...
Logger.timeEnd('API Call'); // Logs: "[EDU-SPHERE] API Call: 234ms"

// API logging
Logger.apiRequest('POST', '/api/v1/students', { name: 'John' });
Logger.apiResponse('POST', '/api/v1/students', 201, { id: 123 });

// Authentication events
Logger.auth('login', { role: 'ADMIN', username: 'admin' });

// Security events
Logger.security('unauthorized_access', { page: 'admin-dashboard' });

// Performance metrics
Logger.performance('Page Load Time', 1234, 'ms');

// Assertions
Logger.assert(user !== null, 'User must be logged in');
```

### Logger Configuration

```javascript
// Configure logger
Logger.configure({
  enabled: true,
  level: 'debug',           // debug, info, warn, error
  showTimestamp: true,
  showLevel: true,
  prefix: '[EDU-SPHERE]'
});

// Change log level
Logger.setLevel('warn');    // Only show warnings and errors

// Disable/Enable
Logger.disable();
Logger.enable();

// URL parameter: ?debug=true (enables debug mode in production)
```

---

## 🔒 Security Best Practices

### XSS Protection

**ALWAYS escape user input before displaying:**

```javascript
// ✅ CORRECT
const name = SECURITY.escapeHtml(student.name);
element.innerHTML = `<div>${name}</div>`;

// ❌ WRONG - XSS vulnerability
element.innerHTML = `<div>${student.name}</div>`;
```

### Input Validation

**Validate on client AND server:**

```javascript
// Client-side validation
const result = Validators.validateForm(formData, rules);
if (!result.valid) {
  Validators.showFormErrors(form, result.errors);
  return;
}

// Sanitize data before sending
const sanitizedData = {
  name: SECURITY.sanitizeText(formData.name),
  email: SECURITY.validateEmail(formData.email),
  phone: SECURITY.validatePhone(formData.phone)
};

// Send to server
API.students.create(sanitizedData);
```

### File Upload Security

```javascript
const fileInput = document.querySelector('#photo');
const file = fileInput.files[0];

// Validate file
const validation = Validators.file(file, {
  maxSize: 5 * 1024 * 1024,                    // 5 MB
  allowedTypes: ['image/jpeg', 'image/png'],
  allowedExtensions: ['jpg', 'jpeg', 'png']
});

if (!validation.valid) {
  API.toast(validation.error, 'danger');
  return;
}

// Additional check with SECURITY module
if (!SECURITY.validateFile(file, ['jpg', 'jpeg', 'png'], 5)) {
  API.toast('Invalid file', 'danger');
  return;
}

// Upload
const formData = new FormData();
formData.append('photo', file);
API.students.create(formData);
```

---

## 🏗️ Build & Deploy

### Development

```bash
# Start development server
npm run dev

# Runs on http://localhost:3000
```

### Production Build

```bash
# Build optimized files
npm run build

# Output:
# dist/js/bundle.min.js      (minified + source map)
# dist/css/adminlte.min.css  (minified + source map)
# dist/assets/img/*          (optimized images)
```

### Linting

```bash
# Check code quality
npm run lint

# Auto-fix issues
npm run lint:fix
```

### Watch Mode

```bash
# Auto-rebuild on file changes
npm run watch
```

---

## 💡 Code Examples

### Example 1: Complete Page with Form

```javascript
// js/pages/add-student.js

(function() {
  let form;
  
  // Validation rules
  const rules = {
    name: [
      { type: 'required', fieldName: 'Student Name' },
      { type: 'minLength', min: 3, fieldName: 'Student Name' }
    ],
    email: [
      { type: 'email' }
    ],
    phone: [
      { type: 'required', fieldName: 'Phone' },
      { type: 'phone' }
    ],
    dateOfBirth: [
      { type: 'required', fieldName: 'Date of Birth' },
      { type: 'age', min: 5, max: 18 }
    ]
  };
  
  function init() {
    form = document.querySelector('#addStudentForm');
    form.addEventListener('submit', handleSubmit);
    
    Logger.info('Add Student page initialized');
  }
  
  async function handleSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Validate
    const validation = Validators.validateForm(data, rules);
    
    if (!validation.valid) {
      Validators.showFormErrors(form, validation.errors);
      return;
    }
    
    // Clear previous errors
    Validators.clearFormErrors(form);
    
    try {
      Logger.time('Create Student');
      
      const result = await API.students.create(formData);
      
      Logger.timeEnd('Create Student');
      Logger.info('Student created:', result);
      
      API.toast('Student added successfully!', 'success');
      
      // Redirect to list page
      setTimeout(() => {
        window.location.href = 'manage-students.html';
      }, 1500);
      
    } catch (error) {
      Logger.error('Failed to create student:', error);
      API.toast(error.message || 'Failed to add student', 'danger');
    }
  }
  
  // Initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    Layout.init({ 
      title: 'Add Student', 
      activeMenu: 'students-add' 
    });
    init();
  });
  
})();
```

### Example 2: Data Table with Search & Pagination

```javascript
// js/pages/manage-students.js

(function() {
  let students = [];
  let currentPage = 1;
  let totalPages = 1;
  
  async function loadStudents(page, search) {
    try {
      Logger.time('Load Students');
      
      const params = { 
        page: page || 1, 
        limit: 20,
        search: search || ''
      };
      
      const response = await API.students.list(params);
      
      Logger.timeEnd('Load Students');
      
      students = response.data;
      currentPage = response.page;
      totalPages = response.totalPages;
      
      renderTable();
      renderPagination();
      
    } catch (error) {
      Logger.error('Failed to load students:', error);
      API.toast('Failed to load students', 'danger');
    }
  }
  
  function renderTable() {
    const tbody = document.querySelector('#studentTable tbody');
    tbody.innerHTML = '';
    
    if (students.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center text-muted py-4">
            No students found
          </td>
        </tr>
      `;
      return;
    }
    
    students.forEach(student => {
      const row = document.createElement('tr');
      
      row.innerHTML = `
        <td>${Formatters.formatRollNumber(student.rollNo)}</td>
        <td>${SECURITY.escapeHtml(student.name)}</td>
        <td>${Formatters.formatClassName(student.class, student.section)}</td>
        <td>${Formatters.formatPhone(student.phone)}</td>
        <td>${Formatters.formatGender(student.gender)}</td>
        <td>${Formatters.formatDate(student.admissionDate, 'short')}</td>
        <td>${Formatters.formatStatusBadge(student.status)}</td>
        <td>
          <button class="btn btn-sm btn-info" onclick="viewStudent(${student.id})">
            <i class="bi bi-eye"></i>
          </button>
          <button class="btn btn-sm btn-warning" onclick="editStudent(${student.id})">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="deleteStudent(${student.id})">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      `;
      
      tbody.appendChild(row);
    });
    
    Logger.debug('Rendered ' + students.length + ' students');
  }
  
  function renderPagination() {
    // Implementation here...
  }
  
  function setupSearch() {
    const searchInput = document.querySelector('#searchInput');
    let debounceTimer;
    
    searchInput.addEventListener('input', function(e) {
      clearTimeout(debounceTimer);
      
      debounceTimer = setTimeout(() => {
        loadStudents(1, e.target.value);
      }, 500);
    });
  }
  
  function init() {
    loadStudents(1);
    setupSearch();
    
    Logger.info('Manage Students page initialized');
  }
  
  document.addEventListener('DOMContentLoaded', function() {
    Layout.init({ 
      title: 'Manage Students', 
      activeMenu: 'students-list' 
    });
    init();
  });
  
  // Expose functions to global scope for onclick handlers
  window.viewStudent = function(id) { /* ... */ };
  window.editStudent = function(id) { /* ... */ };
  window.deleteStudent = function(id) { /* ... */ };
  
})();
```

---

## 📦 File Structure

```
New folder/
├── .eslintrc.json                 # ESLint configuration
├── .gitignore                     # Git ignore rules
├── package.json                   # NPM configuration
├── FRONTEND_USAGE_GUIDE.md        # This file
├── FRONTEND_CODE_QUALITY_AUDIT.md # Audit report
│
├── css/
│   ├── adminlte.css
│   └── custom.css
│
├── js/
│   ├── config.js                  # API configuration
│   ├── auth.js                    # Authentication
│   ├── api.js                     # API wrapper
│   ├── security.js                # Security utilities
│   │
│   ├── components/
│   │   └── layout.js              # Header/Sidebar/Footer
│   │
│   ├── utils/
│   │   ├── formatters.js          # Data formatters
│   │   ├── validators.js          # Form validators
│   │   └── logger.js              # Logging utility
│   │
│   └── pages/
│       ├── manage-students.js
│       ├── add-student.js
│       └── ...
│
├── pages/                          # HTML pages (future reorganization)
│   ├── students/
│   ├── teachers/
│   └── ...
│
└── assets/
    ├── img/
    └── ...
```

---

## 🎯 Best Practices Summary

### DO:
✅ Use `Layout.init()` on every page  
✅ Always escape HTML with `SECURITY.escapeHtml()`  
✅ Validate forms with `Validators.validateForm()`  
✅ Format data with `Formatters` before displaying  
✅ Use `Logger` instead of `console.log`  
✅ Add `defer` to script tags  
✅ Use `try-catch` for async operations  
✅ Keep functions small and focused  
✅ Use meaningful variable names  
✅ Comment complex logic  

### DON'T:
❌ Insert user input directly into HTML  
❌ Skip form validation  
❌ Use `var` (use `const` or `let`)  
❌ Hardcode API URLs  
❌ Leave `console.log` in production  
❌ Skip error handling  
❌ Create global variables unnecessarily  
❌ Duplicate code across pages  
❌ Forget to clear event listeners  
❌ Use inline styles (use CSS classes)  

---

## 🐛 Debugging

### Enable Debug Mode

```javascript
// Method 1: URL parameter
// https://your-site.com/page.html?debug=true

// Method 2: Console
Logger.enable();
Logger.setLevel('debug');

// Method 3: Persistent
localStorage.setItem('debugMode', 'true');
```

### Common Issues

**Issue:** Layout not rendering
```javascript
// Check if Layout.js is loaded
console.log(typeof Layout); // Should be "object"

// Check if DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  Layout.init({ ... });
});
```

**Issue:** Form validation not working
```javascript
// Check if Validators.js is loaded
console.log(typeof Validators); // Should be "object"

// Check validation rules
Logger.debug('Validation rules:', rules);
Logger.debug('Form data:', formData);
const result = Validators.validateForm(formData, rules);
Logger.debug('Validation result:', result);
```

---

## 📞 Support

For questions or issues:
- Check this guide first
- Review the code quality audit: `FRONTEND_CODE_QUALITY_AUDIT.md`
- Check browser console for errors
- Enable debug mode: `?debug=true`

---

**Happy Coding! 🚀**
