/**
 * EDU-SPHERE — Global Header Script
 * Dynamically populates the navbar with the authenticated user's data
 * and loads real notifications/announcements on every page.
 *
 * Include AFTER auth.js and api.js:
 *   <script src="js/auth.js"></script>
 *   <script src="js/api.js"></script>
 *   <script src="js/header.js"></script>
 */

(function () {
  'use strict';

  // ── Helpers ────────────────────────────────────────────────────────────────

  /** Safely set textContent on an element found by selector or id */
  function setText(selectorOrId, value) {
    var el = document.getElementById(selectorOrId) ||
             document.querySelector(selectorOrId);
    if (el) el.textContent = value;
  }

  /** Safely set src on an element */
  function setSrc(selectorOrId, src) {
    var el = document.getElementById(selectorOrId) ||
             document.querySelector(selectorOrId);
    if (el) el.src = src;
  }

  /** Resolve photo URL — prepend API base if it's a server path */
  function resolvePhoto(path) {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    // Use the configured API URL (set by config.js)
    var base = (window.EDUSPHERE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
    return base + path;
  }

  /** Format a relative time string */
  function relativeTime(dateStr) {
    if (!dateStr) return '';
    var diff = Date.now() - new Date(dateStr).getTime();
    var mins = Math.floor(diff / 60000);
    if (mins < 1)  return 'Just now';
    if (mins < 60) return mins + ' min' + (mins > 1 ? 's' : '') + ' ago';
    var hrs = Math.floor(mins / 60);
    if (hrs < 24)  return hrs + ' hr' + (hrs > 1 ? 's' : '') + ' ago';
    var days = Math.floor(hrs / 24);
    return days + ' day' + (days > 1 ? 's' : '') + ' ago';
  }

  // ── 1. User Profile ────────────────────────────────────────────────────────

  function patchUserProfile() {
    // AUTH may not be available on non-protected pages — guard safely
    if (typeof AUTH === 'undefined') return;
    var user = AUTH.getUser();
    if (!user) return;

    var displayName = user.name || user.username || 'Admin';
    var role        = (user.role || 'ADMIN').toUpperCase();
    var roleLabel   = role === 'ADMIN'   ? 'System Administrator' :
                      role === 'TEACHER' ? 'Teacher' :
                      role === 'STUDENT' ? 'Student' : role;
    var defaultPhoto = 'assets/img/user2-160x160.jpg';
    // Handle both root-level and subfolder pages
    var isSubfolder  = window.location.pathname.indexOf('/Classes') > -1 ||
                       window.location.pathname.indexOf('\\Classes') > -1;
    if (isSubfolder) defaultPhoto = '../assets/img/user2-160x160.jpg';
    var photo = resolvePhoto(user.photo) || defaultPhoto;

    // ── Navbar toggle button: name + photo ──────────────────────────────────
    // Pattern: <img class="user-image ..."> <span ...>Ali Saleem</span>
    var userImg = document.querySelector('.user-image.rounded-circle');
    if (userImg) {
      userImg.src = photo;
      userImg.onerror = function () { this.src = defaultPhoto; };
    }
    var nameSpan = document.querySelector('.nav-link.dropdown-toggle .d-none.d-md-inline');
    if (nameSpan) nameSpan.textContent = displayName;

    // ── Dropdown header: photo + name + role ────────────────────────────────
    var headerImg = document.querySelector('.user-header img.rounded-circle');
    if (headerImg) {
      headerImg.src = photo;
      headerImg.onerror = function () { this.src = defaultPhoto; };
    }
    var headerP = document.querySelector('.user-header p');
    if (headerP) {
      headerP.innerHTML = displayName + ' - ' + roleLabel +
        ' <small>Logged in as ' + role + '</small>';
    }

    // ── Sidebar brand username (if present) ─────────────────────────────────
    var sidebarUser = document.querySelector('.sidebar-brand .brand-text');
    // Don't overwrite the school name — only patch explicit user elements

    // ── Sign out link — ensure it calls AUTH.logout ──────────────────────────
    var signOutLinks = document.querySelectorAll('.user-footer a');
    signOutLinks.forEach(function (a) {
      if (a.textContent.trim().toLowerCase().indexOf('sign') > -1 ||
          a.textContent.trim().toLowerCase().indexOf('logout') > -1 ||
          a.textContent.trim().toLowerCase().indexOf('log out') > -1) {
        if (!a.getAttribute('onclick') || a.getAttribute('onclick').indexOf('AUTH') === -1) {
          a.setAttribute('onclick', "AUTH.logout('index.html'); return false;");
          a.href = '#';
        }
      }
    });
  }

  // ── 2. Announcements (chat/messages icon) ──────────────────────────────────

  async function patchAnnouncements() {
    if (typeof API === 'undefined') return;

    // Find the chat badge — first badge inside a nav-item with bi-chat-text
    var chatNavItem = null;
    document.querySelectorAll('.navbar-nav .nav-item.dropdown').forEach(function (li) {
      if (li.querySelector('.bi-chat-text')) chatNavItem = li;
    });
    if (!chatNavItem) return;

    var badge   = chatNavItem.querySelector('.navbar-badge');
    var menuDiv = chatNavItem.querySelector('.dropdown-menu');
    if (!menuDiv) return;

    try {
      var res  = await API.announcements.list({ limit: 5 });
      var list = (res && res.success) ? (res.data || []) : [];
      var count = list.length;

      // Update badge
      if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? '' : 'none';
      }

      // Rebuild dropdown content
      var CAT_ICONS = {
        GENERAL:'bi-megaphone-fill', EXAM:'bi-clipboard-data-fill',
        FEE:'bi-cash-stack', HOLIDAY:'bi-calendar-event',
        EVENT:'bi-star-fill', URGENT:'bi-exclamation-triangle-fill'
      };
      var CAT_COLORS = {
        GENERAL:'text-secondary', EXAM:'text-primary',
        FEE:'text-warning', HOLIDAY:'text-success',
        EVENT:'text-info', URGENT:'text-danger'
      };

      var html = '<span class="dropdown-item dropdown-header">' +
        count + ' Announcement' + (count !== 1 ? 's' : '') + '</span>' +
        '<div class="dropdown-divider"></div>';

      if (!count) {
        html += '<div class="dropdown-item text-muted text-center py-2">No announcements.</div>';
      } else {
        list.forEach(function (a) {
          var icon  = CAT_ICONS[a.category]  || 'bi-megaphone-fill';
          var color = CAT_COLORS[a.category] || 'text-secondary';
          var msg   = (a.message || '').substring(0, 55) + (a.message && a.message.length > 55 ? '…' : '');
          var when  = relativeTime(a.createdAt || a.date);
          html += '<a href="announcements.html" class="dropdown-item">' +
            '<div class="d-flex">' +
              '<div class="flex-shrink-0 me-2 pt-1"><i class="bi ' + icon + ' ' + color + '"></i></div>' +
              '<div class="flex-grow-1">' +
                '<h3 class="dropdown-item-title mb-0" style="font-size:.82rem;font-weight:600">' + (a.title || '') + '</h3>' +
                '<p class="fs-7 mb-0 text-muted" style="font-size:.78rem">' + msg + '</p>' +
                '<p class="fs-7 text-secondary mb-0" style="font-size:.75rem"><i class="bi bi-clock-fill me-1"></i>' + when + '</p>' +
              '</div>' +
            '</div>' +
          '</a><div class="dropdown-divider"></div>';
        });
      }

      html += '<a href="announcements.html" class="dropdown-item dropdown-footer">See All Announcements</a>';
      menuDiv.innerHTML = html;

    } catch (e) {
      if (badge) { badge.textContent = '0'; badge.style.display = 'none'; }
    }
  }

  // ── 3. Notifications (bell icon) ──────────────────────────────────────────

  async function patchNotifications() {
    if (typeof API === 'undefined') return;

    // Find the bell nav-item
    var bellNavItem = null;
    document.querySelectorAll('.navbar-nav .nav-item.dropdown').forEach(function (li) {
      if (li.querySelector('.bi-bell-fill')) bellNavItem = li;
    });
    if (!bellNavItem) return;

    var badge   = bellNavItem.querySelector('.navbar-badge');
    var menuDiv = bellNavItem.querySelector('.dropdown-menu');
    if (!menuDiv) return;

    try {
      var notifications = [];

      // Fetch real data — use allSettled so one failure doesn't break others
      var results = await Promise.allSettled([
        API.reports.dashboard(),
        API.attendance.today(),
        API.exams.upcoming(),
        API.fees.pending(),
      ]);

      var dash     = results[0].status === 'fulfilled' ? results[0].value : null;
      var attToday = results[1].status === 'fulfilled' ? results[1].value : null;
      var upcoming = results[2].status === 'fulfilled' ? results[2].value : null;
      var pending  = results[3].status === 'fulfilled' ? results[3].value : null;

      if (dash && dash.success && dash.data.totalStudents > 0) {
        notifications.push({
          icon: 'bi-mortarboard-fill', color: 'text-primary',
          text: dash.data.totalStudents + ' students enrolled',
          link: 'manage-students.html'
        });
      }

      if (attToday && attToday.success && attToday.data.total > 0) {
        var a   = attToday.data;
        var pct = Math.round((a.present / a.total) * 100);
        var col = pct >= 80 ? 'text-success' : pct >= 60 ? 'text-warning' : 'text-danger';
        notifications.push({
          icon: 'bi-calendar-check-fill', color: col,
          text: 'Today: ' + a.present + '/' + a.total + ' present (' + pct + '%)',
          link: 'student-attendance.html'
        });
      }

      if (upcoming && upcoming.success) {
        var upList = upcoming.data || [];
        if (upList.length > 0) {
          notifications.push({
            icon: 'bi-clipboard-data-fill', color: 'text-info',
            text: upList.length + ' upcoming exam' + (upList.length > 1 ? 's' : '') +
                  (upList[0] ? ' — ' + upList[0].title : ''),
            link: 'create-exam.html'
          });
        }
      }

      if (pending && pending.success) {
        var pendList = pending.data || [];
        if (pendList.length > 0) {
          notifications.push({
            icon: 'bi-cash-stack', color: 'text-warning',
            text: pendList.length + ' student' + (pendList.length > 1 ? 's' : '') + ' with pending fees',
            link: 'pending-fees.html'
          });
        }
      }

      if (dash && dash.success && dash.data.booksIssued > 0) {
        notifications.push({
          icon: 'bi-book-fill', color: 'text-secondary',
          text: dash.data.booksIssued + ' book' + (dash.data.booksIssued > 1 ? 's' : '') + ' currently issued',
          link: 'issue-book.html'
        });
      }

      var count = notifications.length;
      if (badge) badge.textContent = count;

      var html = '<span class="dropdown-item dropdown-header">' +
        count + ' Notification' + (count !== 1 ? 's' : '') + '</span>' +
        '<div class="dropdown-divider"></div>';

      if (!count) {
        html += '<div class="dropdown-item text-muted text-center py-2">No notifications.</div>';
      } else {
        notifications.forEach(function (n) {
          // Resolve link for subfolder pages
          var link = n.link;
          html += '<a href="' + link + '" class="dropdown-item">' +
            '<i class="bi ' + n.icon + ' ' + n.color + ' me-2"></i>' + n.text +
          '</a><div class="dropdown-divider"></div>';
        });
      }

      html += '<a href="reports.html" class="dropdown-item dropdown-footer">View Dashboard</a>';
      menuDiv.innerHTML = html;

    } catch (e) {
      if (badge) badge.textContent = '0';
    }
  }

  // ── Bootstrap: run after DOM is ready ─────────────────────────────────────

  function init() {
    patchUserProfile();
    // Only load live data if API is available (authenticated pages)
    if (typeof API !== 'undefined') {
      patchAnnouncements();
      patchNotifications();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // DOM already ready (script loaded at bottom of body)
    init();
  }

})();
