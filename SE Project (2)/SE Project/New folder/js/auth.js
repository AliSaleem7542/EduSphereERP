/**
 * EDU-SPHERE — Frontend Auth Utility
 * Handles JWT storage, token refresh, and session helpers.
 */

var AUTH = (function () {

  // ─── API Base URL ─────────────────────────────────────────────────────────
  // Auto-detects environment:
  //   Production  → window.EDUSPHERE_API_URL (set in config.js) or Render URL
  //   Development → localhost:5000
  var API_BASE = (function () {
    // 1. Explicit override via global config (set in config.js for production)
    if (typeof window !== 'undefined' && window.EDUSPHERE_API_URL) {
      return window.EDUSPHERE_API_URL.replace(/\/$/, '') + '/api/v1';
    }
    // 2. Running on Vercel/production domain → use Render backend
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' &&
        window.location.hostname !== '127.0.0.1' &&
        !window.location.hostname.startsWith('192.168.')) {
      // Replace with your actual Render URL after deployment
      return 'https://edusphere-api.onrender.com/api/v1';
    }
    // 3. Local development
    return 'http://localhost:5000/api/v1';
  })();

  // ─── Storage Keys ────────────────────────────────────────────────────────────
  var KEYS = {
    ACCESS_TOKEN:  'edu_access_token',
    REFRESH_TOKEN: 'edu_refresh_token',
    USER:          'edu_user',
    ROLE:          'edu_role',
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────────
  function getLoginPage() {
    // Detect if we're in a subfolder and adjust redirect path
    var path = window.location.pathname;
    var depth = (path.match(/\//g) || []).length;
    // If in a subfolder (e.g. Classes & Sections/), go up one level
    if (path.indexOf('/Classes') > -1 || path.indexOf('/classes') > -1) {
      return '../index.html';
    }
    return 'index.html';
  }
  function saveTokens(accessToken, refreshToken, user) {
    localStorage.setItem(KEYS.ACCESS_TOKEN,  accessToken);
    localStorage.setItem(KEYS.REFRESH_TOKEN, refreshToken);
    localStorage.setItem(KEYS.USER,          JSON.stringify(user));
    localStorage.setItem(KEYS.ROLE,          user.role);
  }

  function getAccessToken()  { return localStorage.getItem(KEYS.ACCESS_TOKEN);  }
  function getRefreshToken() { return localStorage.getItem(KEYS.REFRESH_TOKEN); }
  function getUser()         { try { return JSON.parse(localStorage.getItem(KEYS.USER) || 'null'); } catch { return null; } }
  function getRole()         { return localStorage.getItem(KEYS.ROLE); }

  function clearTokens() {
    Object.values(KEYS).forEach(function (k) { localStorage.removeItem(k); });
    // Also clear legacy session keys
    sessionStorage.removeItem('adminSession');
    sessionStorage.removeItem('teacherSession');
    sessionStorage.removeItem('studentSession');
  }

  function isTokenExpired(token) {
    if (!token) return true;
    try {
      var payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now() + 30000; // 30s buffer
    } catch {
      return true;
    }
  }

  // ─── API Call with auto-refresh ───────────────────────────────────────────────
  async function apiFetch(path, options) {
    options = options || {};
    var token = getAccessToken();

    if (token && isTokenExpired(token)) {
      var refreshed = await tryRefresh();
      if (!refreshed) {
        clearTokens();
        window.location.href = getLoginPage();
        return null;
      }
      token = getAccessToken();
    }

    // Don't set Content-Type for FormData (browser sets it with boundary)
    var isFormData = options.body instanceof FormData;
    var defaultHeaders = {
      'Authorization': token ? 'Bearer ' + token : '',
    };
    if (!isFormData) {
      defaultHeaders['Content-Type'] = 'application/json';
    }
    options.headers = Object.assign(defaultHeaders, options.headers || {});

    var res = await fetch(API_BASE + path, options);

    if (res.status === 401) {
      var refreshed = await tryRefresh();
      if (!refreshed) {
        clearTokens();
        window.location.href = getLoginPage();
        return null;
      }
      options.headers['Authorization'] = 'Bearer ' + getAccessToken();
      // Re-set content type for retry (only if not FormData)
      if (!(options.body instanceof FormData) && !options.headers['Content-Type']) {
        options.headers['Content-Type'] = 'application/json';
      }
      res = await fetch(API_BASE + path, options);
    }

    return res;
  }

  async function tryRefresh() {
    var refreshToken = getRefreshToken();
    if (!refreshToken) return false;
    try {
      var res = await fetch(API_BASE + '/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refreshToken }),
      });
      if (!res.ok) return false;
      var data = await res.json();
      if (data.success && data.data) {
        localStorage.setItem(KEYS.ACCESS_TOKEN,  data.data.accessToken);
        localStorage.setItem(KEYS.REFRESH_TOKEN, data.data.refreshToken);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // ─── Login Functions ──────────────────────────────────────────────────────────
  async function loginAdmin(username, password) {
    var res = await fetch(API_BASE + '/auth/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username, password: password }),
    });
    var data = await res.json();
    if (data.success) {
      saveTokens(data.data.accessToken, data.data.refreshToken, data.data.user);
      // Keep legacy session for pages that still check sessionStorage
      sessionStorage.setItem('adminSession', JSON.stringify({
        id:       data.data.user.id,
        username: data.data.user.username,
        name:     data.data.user.username,
        role:     data.data.user.role,
      }));
      return { success: true };
    }
    return { success: false, message: data.message || 'Login failed' };
  }

  async function loginTeacher(phone, password) {
    var res = await fetch(API_BASE + '/auth/teacher/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phone, password: password }),
    });
    var data = await res.json();
    if (data.success) {
      saveTokens(data.data.accessToken, data.data.refreshToken, data.data.user);
      sessionStorage.setItem('teacherSession', JSON.stringify({
        id:    data.data.user.teacherId || data.data.user.id,
        name:  data.data.user.name,
        phone: data.data.user.phone,
        role:  data.data.user.role,
      }));
      return { success: true };
    }
    return { success: false, message: data.message || 'Login failed' };
  }

  async function loginStudent(rollNo, password) {
    var res = await fetch(API_BASE + '/auth/student/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rollNo: rollNo, password: password }),
    });
    var data = await res.json();
    if (data.success) {
      saveTokens(data.data.accessToken, data.data.refreshToken, data.data.user);
      sessionStorage.setItem('studentSession', JSON.stringify({
        id:      data.data.user.studentId || data.data.user.id,
        rollNo:  data.data.user.rollNo,
        name:    data.data.user.name,
        class:   data.data.user.class,
        section: data.data.user.section,
        role:    data.data.user.role,
      }));
      return { success: true };
    }
    return { success: false, message: data.message || 'Login failed' };
  }

  // ─── Logout ───────────────────────────────────────────────────────────────────
  async function logout(redirectTo) {
    var refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await fetch(API_BASE + '/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: refreshToken }),
        });
      } catch { /* ignore */ }
    }
    clearTokens();
    window.location.href = redirectTo || 'index.html';
  }

  // ─── Auth Guard ───────────────────────────────────────────────────────────────
  function requireAuth(expectedRole) {
    var token = getAccessToken();
    var role  = getRole();

    // If token exists and is valid, check role
    if (token && !isTokenExpired(token)) {
      if (expectedRole && role !== expectedRole) {
        window.location.href = getLoginPage();
      }
      return;
    }

    // Token is missing — try sessionStorage fallback (first load before refresh)
    if (!token) {
      if (expectedRole === 'ADMIN'   && sessionStorage.getItem('adminSession'))   return;
      if (expectedRole === 'TEACHER' && sessionStorage.getItem('teacherSession')) return;
      if (expectedRole === 'STUDENT' && sessionStorage.getItem('studentSession')) return;
    }

    // Token expired or missing with no session — clear and redirect
    clearTokens();
    window.location.href = getLoginPage();
  }

  // ─── Check already logged in (for login pages) ────────────────────────────────
  function redirectIfLoggedIn() {
    var role = getRole();
    var token = getAccessToken();
    if (token && !isTokenExpired(token)) {
      if (role === 'ADMIN')   { window.location.href = 'index2.html';            return; }
      if (role === 'TEACHER') { window.location.href = 'teacher-dashboard.html'; return; }
      if (role === 'STUDENT') { window.location.href = 'student-dashboard.html'; return; }
    }
    // Legacy fallback
    if (sessionStorage.getItem('adminSession'))   { window.location.href = 'index2.html';            return; }
    if (sessionStorage.getItem('teacherSession')) { window.location.href = 'teacher-dashboard.html'; return; }
    if (sessionStorage.getItem('studentSession')) { window.location.href = 'student-dashboard.html'; return; }
  }

  // ─── Public API ───────────────────────────────────────────────────────────────
  return {
    API_BASE:          API_BASE,
    loginAdmin:        loginAdmin,
    loginTeacher:      loginTeacher,
    loginStudent:      loginStudent,
    logout:            logout,
    requireAuth:       requireAuth,
    redirectIfLoggedIn: redirectIfLoggedIn,
    getAccessToken:    getAccessToken,
    getRefreshToken:   getRefreshToken,
    getUser:           getUser,
    getRole:           getRole,
    clearTokens:       clearTokens,
    apiFetch:          apiFetch,
    isTokenExpired:    isTokenExpired,
  };

})();
