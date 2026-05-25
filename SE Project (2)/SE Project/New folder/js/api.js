/**
 * EDU-SPHERE — API Helper Layer
 * Wraps AUTH.apiFetch with convenience methods for every module.
 */

var API = (function () {

  // ─── Generic helpers ─────────────────────────────────────────────────────────
  async function get(path, params) {
    var qs = params ? '?' + new URLSearchParams(params).toString() : '';
    var res = await AUTH.apiFetch(path + qs);
    if (!res) return null;
    return res.json();
  }

  async function post(path, body) {
    var res = await AUTH.apiFetch(path, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    if (!res) return null;
    return res.json();
  }

  async function put(path, body) {
    var res = await AUTH.apiFetch(path, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    if (!res) return null;
    return res.json();
  }

  async function patch(path, body) {
    var res = await AUTH.apiFetch(path, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res) return null;
    return res.json();
  }

  async function del(path) {
    var res = await AUTH.apiFetch(path, { method: 'DELETE' });
    if (!res) return null;
    return res.json();
  }

  async function postForm(path, formData) {
    var token = AUTH.getAccessToken();
    var res = await fetch(AUTH.API_BASE + path, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token },
      body: formData,
    });
    if (!res) return null;
    return res.json();
  }

  // ─── Students ─────────────────────────────────────────────────────────────────
  var students = {
    list:       function (p) { return get('/students', p); },
    get:        function (id) { return get('/students/' + id); },
    create:     function (fd) { return postForm('/students', fd); },
    update:     function (id, fd) {
      var token = AUTH.getAccessToken();
      return fetch(AUTH.API_BASE + '/students/' + id, {
        method: 'PUT',
        headers: { Authorization: 'Bearer ' + token },
        body: fd,
      }).then(function (r) { return r.json(); });
    },
    remove:     function (id) { return del('/students/' + id); },
    attendance: function (id, p) { return get('/students/' + id + '/attendance', p); },
    results:    function (id) { return get('/students/' + id + '/results'); },
    fees:       function (id) { return get('/students/' + id + '/fees'); },
    books:      function (id) { return get('/students/' + id + '/books'); },
    promote:    function (id, body) { return post('/students/' + id + '/promote', body); },
  };

  // ─── Teachers ─────────────────────────────────────────────────────────────────
  var teachers = {
    list:           function (p) { return get('/teachers', p); },
    get:            function (id) { return get('/teachers/' + id); },
    create:         function (fd) { return postForm('/teachers', fd); },
    update:         function (id, fd) {
      var token = AUTH.getAccessToken();
      return fetch(AUTH.API_BASE + '/teachers/' + id, {
        method: 'PUT',
        headers: { Authorization: 'Bearer ' + token },
        body: fd,
      }).then(function (r) { return r.json(); });
    },
    remove:         function (id) { return del('/teachers/' + id); },
    subjects:       function (id) { return get('/teachers/' + id + '/subjects'); },
    schedule:       function (id) { return get('/teachers/' + id + '/schedule'); },
    myStudents:     function (id) { return get('/teachers/' + id + '/students'); },
    assignSubjects: function (id, body) { return post('/teachers/' + id + '/assign-subjects', body); },
  };

  // ─── Classes ──────────────────────────────────────────────────────────────────
  var classes = {
    list:           function (p) { return get('/classes', p); },
    create:         function (b) { return post('/classes', b); },
    update:         function (id, b) { return put('/classes/' + id, b); },
    remove:         function (id) { return del('/classes/' + id); },
    sections:       function (id) { return get('/classes/' + id + '/sections'); },
    createSection:  function (id, b) { return post('/classes/' + id + '/sections', b); },
    updateSection:  function (sectionId, b) { return put('/classes/sections/' + sectionId, b); },
    deleteSection:  function (sectionId) { return del('/classes/sections/' + sectionId); },
    assignTeacher:  function (sid, b) { return post('/classes/sections/' + sid + '/assign-teacher', b); },
  };

  // ─── Subjects ─────────────────────────────────────────────────────────────────
  var subjects = {
    list:   function (p) { return get('/subjects', p); },
    create: function (b) { return post('/subjects', b); },
    update: function (id, b) { return put('/subjects/' + id, b); },
    remove: function (id) { return del('/subjects/' + id); },
  };

  // ─── Timetable ────────────────────────────────────────────────────────────────
  var timetable = {
    list:           function (p) { return get('/timetable', p); },
    create:         function (b) { return post('/timetable', b); },
    update:         function (id, b) { return put('/timetable/' + id, b); },
    remove:         function (id) { return del('/timetable/' + id); },
    forTeacher:     function (id) { return get('/timetable/teacher/' + id); },
    forClass:       function (cid, sid) { return get('/timetable/class/' + cid + '/section/' + sid); },
  };

  // ─── Attendance ───────────────────────────────────────────────────────────────
  var attendance = {
    listStudents:   function (p) { return get('/attendance/students', p); },
    markStudents:   function (b) { return post('/attendance/students', b); },
    report:         function (p) { return get('/attendance/students/report', p); },
    listTeachers:   function (p) { return get('/attendance/teachers', p); },
    markTeachers:   function (b) { return post('/attendance/teachers', b); },
    today:          function () { return get('/attendance/today'); },
  };

  // ─── Exams ────────────────────────────────────────────────────────────────────
  var exams = {
    list:     function (p) { return get('/exams', p); },
    upcoming: function () { return get('/exams/upcoming'); },
    get:      function (id) { return get('/exams/' + id); },
    create:   function (b) { return post('/exams', b); },
    update:   function (id, b) { return put('/exams/' + id, b); },
    remove:   function (id) { return del('/exams/' + id); },
  };

  // ─── Results ──────────────────────────────────────────────────────────────────
  var results = {
    list:       function (p) { return get('/results', p); },
    saveBulk:   function (b) { return post('/results/bulk', b); },
    update:     function (id, b) { return put('/results/' + id, b); },
    remove:     function (id) { return del('/results/' + id); },
    byStudent:  function (id) { return get('/results/student/' + id); },
    byExam:     function (id) { return get('/results/exam/' + id); },
  };

  // ─── Fees ─────────────────────────────────────────────────────────────────────
  var fees = {
    list:          function (p) { return get('/fees', p); },
    get:           function (id) { return get('/fees/' + id); },
    collect:       function (b) { return post('/fees', b); },
    void:          function (id) { return del('/fees/' + id); },
    pending:       function () { return get('/fees/pending'); },
    summary:       function () { return get('/fees/summary'); },
    refunds:       function () { return get('/fees/refunds'); },
    processRefund: function (b) { return post('/fees/refunds', b); },
  };

  // ─── Accounts ─────────────────────────────────────────────────────────────────
  var accounts = {
    entries:      function (p) { return get('/accounts/entries', p); },
    create:       function (b) { return post('/accounts/entries', b); },
    update:       function (id, b) { return put('/accounts/entries/' + id, b); },
    remove:       function (id) { return del('/accounts/entries/' + id); },
    ledger:       function () { return get('/accounts/ledger'); },
    balanceSheet: function () { return get('/accounts/balance-sheet'); },
  };

  // ─── Library ──────────────────────────────────────────────────────────────────
  var library = {
    books:    function (p) { return get('/library/books', p); },
    addBook:  function (b) { return post('/library/books', b); },
    update:   function (id, b) { return put('/library/books/' + id, b); },
    remove:   function (id) { return del('/library/books/' + id); },
    issue:    function (b) { return post('/library/issue', b); },
    return:   function (id) { return post('/library/return/' + id, {}); },
    issues:   function (p) { return get('/library/issues', p); },
    overdue:  function () { return get('/library/overdue'); },
  };

  // ─── Announcements ────────────────────────────────────────────────────────────
  var announcements = {
    list:      function (p) { return get('/announcements', p); },
    get:       function (id) { return get('/announcements/' + id); },
    create:    function (b) { return post('/announcements', b); },
    update:    function (id, b) { return put('/announcements/' + id, b); },
    remove:    function (id) { return del('/announcements/' + id); },
    togglePin: function (id) { return patch('/announcements/' + id + '/pin'); },
  };

  // ─── Reports ──────────────────────────────────────────────────────────────────
  var reports = {
    dashboard:  function () { return get('/reports/dashboard'); },
    attendance: function (p) { return get('/reports/attendance', p); },
    fees:       function (p) { return get('/reports/fees', p); },
    results:    function (p) { return get('/reports/results', p); },
    library:    function () { return get('/reports/library'); },
  };

  // ─── System ───────────────────────────────────────────────────────────────────
  var system = {
    settings:         function () { return get('/system/settings'); },
    updateSettings:   function (b) { return put('/system/settings', b); },
    logs:             function (p) { return get('/system/logs', p); },
    academicYears:    function () { return get('/system/academic-years'); },
    createYear:       function (b) { return post('/system/academic-years', b); },
    setCurrentYear:   function (id) { return patch('/system/academic-years/' + id + '/set-current'); },
  };

  // ─── Users ────────────────────────────────────────────────────────────────────
  var users = {
    list:       function () { return get('/users'); },
    create:     function (b) { return post('/users', b); },
    update:     function (id, b) { return put('/users/' + id, b); },
    deactivate: function (id) { return del('/users/' + id); },
    roles:      function () { return get('/users/roles'); },
  };

  // ─── UI Helpers ───────────────────────────────────────────────────────────────
  function toast(msg, type) {
    type = type || 'success';
    var colors = { success: '#198754', danger: '#dc3545', warning: '#ffc107', info: '#0dcaf0' };
    var t = document.createElement('div');
    t.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;padding:12px 20px;border-radius:8px;color:#fff;font-size:0.9rem;box-shadow:0 4px 12px rgba(0,0,0,0.2);background:' + (colors[type] || colors.success) + ';max-width:320px;word-break:break-word;';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 3500);
  }

  function spinner(show, btnId) {
    var btn = document.getElementById(btnId);
    if (!btn) return;
    if (show) {
      btn._origHTML = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Loading...';
    } else {
      btn.disabled = false;
      btn.innerHTML = btn._origHTML || btn.innerHTML;
    }
  }

  function fmtDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function fmtMoney(n) {
    return 'Rs. ' + Number(n || 0).toLocaleString();
  }

  return {
    students, teachers, classes, subjects, timetable,
    attendance, exams, results, fees, accounts,
    library, announcements, reports, system, users,
    toast, spinner, fmtDate, fmtMoney,
  };

})();
