/**
 * EDU-SPHERE — Layout Components
 * Reusable header, sidebar, and footer components
 * @version 1.0.0
 */

var Layout = (function() {
  
  /**
   * Render page header/navbar
   * @param {object} options - { title, showNotifications, showProfile }
   */
  function renderHeader(options) {
    options = options || {};
    var user = AUTH.getUser() || {};
    var role = AUTH.getRole() || '';
    
    var headerHTML = `
      <nav class="main-header navbar navbar-expand navbar-white navbar-light">
        <!-- Left navbar links -->
        <ul class="navbar-nav">
          <li class="nav-item">
            <a class="nav-link" data-widget="pushmenu" href="#" role="button">
              <i class="bi bi-list" style="font-size:1.3rem"></i>
            </a>
          </li>
          <li class="nav-item d-none d-sm-inline-block">
            <span class="nav-link text-dark fw-bold">${SECURITY.escapeHtml(options.title || 'Dashboard')}</span>
          </li>
        </ul>

        <!-- Right navbar links -->
        <ul class="navbar-nav ml-auto">
          ${options.showNotifications !== false ? renderNotificationIcon() : ''}
          <li class="nav-item">
            <a class="nav-link" href="#" onclick="AUTH.logout(); return false;">
              <i class="bi bi-box-arrow-right"></i> Logout
            </a>
          </li>
        </ul>
      </nav>
    `;
    
    var headerContainer = document.querySelector('.main-header');
    if (headerContainer) {
      headerContainer.outerHTML = headerHTML;
    }
  }
  
  /**
   * Render notification icon
   */
  function renderNotificationIcon() {
    return `
      <li class="nav-item">
        <a class="nav-link" href="announcements.html">
          <i class="bi bi-bell"></i>
        </a>
      </li>
    `;
  }
  
  /**
   * Render sidebar navigation
   * @param {string} activeItem - Currently active menu item ID
   */
  function renderSidebar(activeItem) {
    var role = AUTH.getRole() || '';
    var user = AUTH.getUser() || {};
    
    var sidebarHTML = `
      <aside class="main-sidebar sidebar-dark-primary elevation-4">
        <!-- Brand Logo -->
        <a href="${getHomePage(role)}" class="brand-link">
          <img src="assets/img/eduspherelogo (2).png" alt="Logo" class="brand-image img-circle elevation-3" style="opacity: .8">
          <span class="brand-text font-weight-light">EDU-SPHERE</span>
        </a>

        <!-- Sidebar -->
        <div class="sidebar">
          <!-- Sidebar user panel -->
          <div class="user-panel mt-3 pb-3 mb-3 d-flex">
            <div class="image">
              <i class="bi bi-person-circle" style="font-size:2rem;color:#fff"></i>
            </div>
            <div class="info">
              <a href="#" class="d-block">${SECURITY.escapeHtml(user.name || user.username || role)}</a>
            </div>
          </div>

          <!-- Sidebar Menu -->
          <nav class="mt-2">
            ${renderSidebarMenu(role, activeItem)}
          </nav>
        </div>
      </aside>
    `;
    
    var sidebarContainer = document.querySelector('.main-sidebar');
    if (sidebarContainer) {
      sidebarContainer.outerHTML = sidebarHTML;
    }
  }
  
  /**
   * Get home page URL based on role
   */
  function getHomePage(role) {
    var homePages = {
      'ADMIN': 'index2.html',
      'TEACHER': 'teacher-dashboard.html',
      'STUDENT': 'student-dashboard.html',
      'CASHIER': 'cashier-dashboard.html',
      'LIBRARIAN': 'librarian-dashboard.html',
    };
    return homePages[role] || 'index.html';
  }
  
  /**
   * Render sidebar menu based on role
   */
  function renderSidebarMenu(role, activeItem) {
    var menus = {
      'ADMIN': getAdminMenu(),
      'TEACHER': getTeacherMenu(),
      'STUDENT': getStudentMenu(),
      'CASHIER': getCashierMenu(),
      'LIBRARIAN': getLibrarianMenu(),
    };
    
    var menuItems = menus[role] || [];
    return renderMenuItems(menuItems, activeItem);
  }
  
  /**
   * Render menu items HTML
   */
  function renderMenuItems(items, activeItem) {
    return `
      <ul class="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu">
        ${items.map(item => renderMenuItem(item, activeItem)).join('')}
      </ul>
    `;
  }
  
  /**
   * Render single menu item
   */
  function renderMenuItem(item, activeItem) {
    var isActive = item.id === activeItem ? 'active' : '';
    
    if (item.children) {
      // Menu with submenu
      return `
        <li class="nav-item ${item.open ? 'menu-open' : ''}">
          <a href="#" class="nav-link ${isActive}">
            <i class="nav-icon ${item.icon}"></i>
            <p>
              ${SECURITY.escapeHtml(item.label)}
              <i class="right bi bi-chevron-right"></i>
            </p>
          </a>
          <ul class="nav nav-treeview">
            ${item.children.map(child => `
              <li class="nav-item">
                <a href="${child.url}" class="nav-link ${child.id === activeItem ? 'active' : ''}">
                  <i class="bi bi-circle nav-icon" style="font-size:0.5rem"></i>
                  <p>${SECURITY.escapeHtml(child.label)}</p>
                </a>
              </li>
            `).join('')}
          </ul>
        </li>
      `;
    }
    
    // Simple menu item
    return `
      <li class="nav-item">
        <a href="${item.url}" class="nav-link ${isActive}">
          <i class="nav-icon ${item.icon}"></i>
          <p>${SECURITY.escapeHtml(item.label)}</p>
        </a>
      </li>
    `;
  }
  
  /**
   * Admin menu structure
   */
  function getAdminMenu() {
    return [
      { id: 'dashboard', label: 'Dashboard', icon: 'bi bi-speedometer2', url: 'index2.html' },
      {
        id: 'students',
        label: 'Students',
        icon: 'bi bi-people',
        children: [
          { id: 'students-list', label: 'Manage Students', url: 'manage-students.html' },
          { id: 'students-add', label: 'Add Student', url: 'add-student.html' },
          { id: 'students-import', label: 'Import Students', url: 'import-students.html' },
          { id: 'students-promote', label: 'Promotions', url: 'student-promotions.html' },
        ]
      },
      {
        id: 'teachers',
        label: 'Teachers',
        icon: 'bi bi-person-badge',
        children: [
          { id: 'teachers-list', label: 'Manage Teachers', url: 'manage-teachers.html' },
          { id: 'teachers-add', label: 'Add Teacher', url: 'add-teacher.html' },
          { id: 'teachers-schedule', label: 'Teacher Schedule', url: 'teacher-schedule.html' },
        ]
      },
      {
        id: 'academics',
        label: 'Academics',
        icon: 'bi bi-book',
        children: [
          { id: 'classes', label: 'Classes & Sections', url: 'Classes & Sections/manage-classes.html' },
          { id: 'timetable', label: 'Timetable', url: 'timetable.html' },
          { id: 'exams', label: 'Exams', url: 'create-exam.html' },
          { id: 'results', label: 'Results', url: 'result-management.html' },
        ]
      },
      {
        id: 'attendance',
        label: 'Attendance',
        icon: 'bi bi-calendar-check',
        children: [
          { id: 'attendance-student', label: 'Student Attendance', url: 'student-attendance.html' },
          { id: 'attendance-teacher', label: 'Teacher Attendance', url: 'teacher-attendance.html' },
          { id: 'attendance-reports', label: 'Reports', url: 'attendance-reports.html' },
        ]
      },
      {
        id: 'fees',
        label: 'Fees',
        icon: 'bi bi-cash-coin',
        children: [
          { id: 'fees-collect', label: 'Collect Fee', url: 'collect-fee.html' },
          { id: 'fees-records', label: 'Fee Records', url: 'fee-records.html' },
          { id: 'fees-pending', label: 'Pending Fees', url: 'pending-fees.html' },
          { id: 'fees-refunds', label: 'Refunds', url: 'fee-refunds.html' },
        ]
      },
      {
        id: 'accounts',
        label: 'Accounts',
        icon: 'bi bi-calculator',
        children: [
          { id: 'accounts-entry', label: 'Entry', url: 'accounts-entry.html' },
          { id: 'accounts-ledger', label: 'Ledger', url: 'accounts-ledger.html' },
          { id: 'accounts-balance', label: 'Balance Sheet', url: 'accounts-balance.html' },
        ]
      },
      {
        id: 'library',
        label: 'Library',
        icon: 'bi bi-journal-bookmark',
        children: [
          { id: 'library-books', label: 'Manage Books', url: 'add-book.html' },
          { id: 'library-issue', label: 'Issue Book', url: 'issue-book.html' },
          { id: 'library-return', label: 'Return Book', url: 'return-book.html' },
        ]
      },
      { id: 'announcements', label: 'Announcements', icon: 'bi bi-megaphone', url: 'announcements.html' },
      { id: 'reports', label: 'Reports', icon: 'bi bi-graph-up', url: 'reports.html' },
      { id: 'settings', label: 'Settings', icon: 'bi bi-gear', url: 'settings.html' },
    ];
  }
  
  /**
   * Teacher menu structure
   */
  function getTeacherMenu() {
    return [
      { id: 'dashboard', label: 'Dashboard', icon: 'bi bi-speedometer2', url: 'teacher-dashboard.html' },
      { id: 'my-schedule', label: 'My Schedule', icon: 'bi bi-calendar3', url: 'teacher-my-schedule.html' },
      { id: 'my-students', label: 'My Students', icon: 'bi bi-people', url: 'teacher-my-students.html' },
      { id: 'mark-attendance', label: 'Mark Attendance', icon: 'bi bi-calendar-check', url: 'teacher-mark-attendance.html' },
      { id: 'enter-results', label: 'Enter Results', icon: 'bi bi-pencil-square', url: 'teacher-enter-results.html' },
      { id: 'exams', label: 'Exams', icon: 'bi bi-clipboard', url: 'teacher-exams-view.html' },
      { id: 'announcements', label: 'Announcements', icon: 'bi bi-megaphone', url: 'teacher-announcements-view.html' },
      { id: 'profile', label: 'My Profile', icon: 'bi bi-person', url: 'teacher-profile.html' },
    ];
  }
  
  /**
   * Student menu structure
   */
  function getStudentMenu() {
    return [
      { id: 'dashboard', label: 'Dashboard', icon: 'bi bi-speedometer2', url: 'student-dashboard.html' },
      { id: 'profile', label: 'My Profile', icon: 'bi bi-person', url: 'student-profile.html' },
      { id: 'timetable', label: 'Timetable', icon: 'bi bi-calendar3', url: 'student-timetable-view.html' },
      { id: 'attendance', label: 'My Attendance', icon: 'bi bi-calendar-check', url: 'student-attendance-view.html' },
      { id: 'exams', label: 'Exams', icon: 'bi bi-clipboard', url: 'student-exams-view.html' },
      { id: 'results', label: 'My Results', icon: 'bi bi-graph-up', url: 'student-results-view.html' },
      { id: 'fees', label: 'Fee Details', icon: 'bi bi-cash-coin', url: 'student-fee-view.html' },
      { id: 'library', label: 'Library', icon: 'bi bi-book', url: 'student-library-view.html' },
      { id: 'announcements', label: 'Announcements', icon: 'bi bi-megaphone', url: 'student-announcements-view.html' },
    ];
  }
  
  /**
   * Cashier menu structure
   */
  function getCashierMenu() {
    return [
      { id: 'dashboard', label: 'Dashboard', icon: 'bi bi-speedometer2', url: 'cashier-dashboard.html' },
      { id: 'collect-fee', label: 'Collect Fee', icon: 'bi bi-cash-coin', url: 'collect-fee.html' },
      { id: 'fee-records', label: 'Fee Records', icon: 'bi bi-journal-text', url: 'fee-records.html' },
      { id: 'pending-fees', label: 'Pending Fees', icon: 'bi bi-exclamation-circle', url: 'pending-fees.html' },
      { id: 'refunds', label: 'Refunds', icon: 'bi bi-arrow-counterclockwise', url: 'fee-refunds.html' },
    ];
  }
  
  /**
   * Librarian menu structure
   */
  function getLibrarianMenu() {
    return [
      { id: 'dashboard', label: 'Dashboard', icon: 'bi bi-speedometer2', url: 'librarian-dashboard.html' },
      { id: 'books', label: 'Manage Books', icon: 'bi bi-book', url: 'add-book.html' },
      { id: 'issue', label: 'Issue Book', icon: 'bi bi-box-arrow-right', url: 'issue-book.html' },
      { id: 'return', label: 'Return Book', icon: 'bi bi-box-arrow-in-left', url: 'return-book.html' },
    ];
  }
  
  /**
   * Render footer
   */
  function renderFooter() {
    var footerHTML = `
      <footer class="main-footer">
        <strong>Copyright © ${new Date().getFullYear()} <a href="#">EDU-SPHERE</a>.</strong>
        All rights reserved.
        <div class="float-right d-none d-sm-inline-block">
          <b>Version</b> 3.0.0
        </div>
      </footer>
    `;
    
    var footerContainer = document.querySelector('.main-footer');
    if (footerContainer) {
      footerContainer.outerHTML = footerHTML;
    }
  }
  
  /**
   * Initialize layout
   * @param {object} options - { title, activeMenu, showNotifications }
   */
  function init(options) {
    options = options || {};
    renderHeader({ title: options.title, showNotifications: options.showNotifications });
    renderSidebar(options.activeMenu);
    renderFooter();
  }
  
  // Public API
  return {
    renderHeader: renderHeader,
    renderSidebar: renderSidebar,
    renderFooter: renderFooter,
    init: init,
  };
  
})();

// Make it available globally
if (typeof window !== 'undefined') {
  window.Layout = Layout;
}
