/**
 * Role-Based Sidebar Filter
 * This script filters the sidebar menu based on user role
 * Cashier: Only Fee Management
 * Librarian: Only Library
 */

(function() {
  // Run after DOM is loaded
  document.addEventListener('DOMContentLoaded', function() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userRole = user.role ? user.role.toUpperCase() : '';

    if (!userRole || userRole === 'ADMIN' || userRole === 'TEACHER' || userRole === 'STUDENT') {
      // For ADMIN, TEACHER, STUDENT - keep full sidebar (already handled by existing logic)
      return;
    }

    // Get sidebar menu
    const sidebarMenu = document.querySelector('.sidebar-menu');
    if (!sidebarMenu) return;

    const allMenuItems = sidebarMenu.querySelectorAll(':scope > li.nav-item');

    if (userRole === 'CASHIER') {
      // CASHIER: Only show Fee Management
      allMenuItems.forEach(item => {
        const linkText = item.querySelector('a p')?.textContent || '';
        
        // Keep only Fee Management and hide everything else
        if (linkText.includes('Fee Management')) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });

      // Update brand link to go to cashier dashboard
      const brandLink = document.querySelector('.brand-link');
      if (brandLink) {
        brandLink.href = 'cashier-dashboard.html';
      }

      // Update top navbar links
      const navbarDashLink = document.querySelector('.navbar-nav a[href="index2.html"]');
      if (navbarDashLink) {
        navbarDashLink.href = 'cashier-dashboard.html';
        navbarDashLink.textContent = 'Cashier Dashboard';
      }
    } 
    else if (userRole === 'LIBRARIAN') {
      // LIBRARIAN: Only show Library
      allMenuItems.forEach(item => {
        const linkText = item.querySelector('a p')?.textContent || '';
        
        // Keep only Library and hide everything else
        if (linkText.includes('Library')) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });

      // Update brand link to go to librarian dashboard
      const brandLink = document.querySelector('.brand-link');
      if (brandLink) {
        brandLink.href = 'librarian-dashboard.html';
      }

      // Update top navbar links
      const navbarDashLink = document.querySelector('.navbar-nav a[href="index2.html"]');
      if (navbarDashLink) {
        navbarDashLink.href = 'librarian-dashboard.html';
        navbarDashLink.textContent = 'Librarian Dashboard';
      }
    }
  });
})();
