/**
 * EDU-SPHERE — Full API Validation Test
 * Tests all critical endpoints after import
 */
require('dotenv').config();
const http = require('http');

const BASE = 'http://localhost:5000/api/v1';
let token = '';
let pass = 0, fail = 0;

function req(method, path, body, auth) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'localhost', port: 5000,
      path: '/api/v1' + path, method,
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? { 'Authorization': 'Bearer ' + token } : {}),
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const r = http.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch(e) { resolve({ status: res.statusCode, body: d }); }
      });
    });
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

function ok(label, cond, detail) {
  if (cond) { console.log('  ✅', label); pass++; }
  else { console.log('  ❌', label, detail || ''); fail++; }
}

async function run() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  EDU-SPHERE — API Validation Tests');
  console.log('═══════════════════════════════════════════════════════\n');

  // ── Health ────────────────────────────────────────────────────────────────
  console.log('📡 Health Check');
  const h = await new Promise((resolve, reject) => {
    const r = http.request({ hostname:'localhost', port:5000, path:'/health', method:'GET' }, res => {
      let d=''; res.on('data',c=>d+=c); res.on('end',()=>resolve({status:res.statusCode,body:JSON.parse(d)}));
    });
    r.on('error', reject); r.end();
  });
  ok('Server running', h.status === 200 && h.body.success);

  // ── Admin Login ───────────────────────────────────────────────────────────
  console.log('\n🔐 Admin Login');
  const login = await req('POST', '/auth/admin/login', { username: 'admin', password: 'admin123' });
  ok('Login success', login.status === 200 && login.body.success, JSON.stringify(login.body).slice(0,100));
  if (login.body.data) token = login.body.data.accessToken;
  ok('Token received', !!token);

  // ── Students ──────────────────────────────────────────────────────────────
  console.log('\n🎓 Students API');
  const students = await req('GET', '/students?limit=5', null, true);
  ok('List students', students.status === 200 && students.body.success);
  const total = students.body.data && students.body.data.pagination && students.body.data.pagination.total;
  ok('252 students in DB', total === 252, 'got: ' + total);

  // ── Classes ───────────────────────────────────────────────────────────────
  console.log('\n📚 Classes API');
  const classes = await req('GET', '/classes', null, true);
  ok('List classes', classes.status === 200 && classes.body.success);
  const classCount = classes.body.data && classes.body.data.length;
  ok('1 class (1st Year)', classCount === 1, 'got: ' + classCount);
  const sections = classes.body.data && classes.body.data[0] && classes.body.data[0].sections;
  ok('12 sections', sections && sections.length === 12, 'got: ' + (sections && sections.length));

  // ── Fee Records ───────────────────────────────────────────────────────────
  console.log('\n💰 Fee Records API');
  const fees = await req('GET', '/fees?limit=5', null, true);
  ok('List fees', fees.status === 200 && fees.body.success);
  const feeTotal = fees.body.data && fees.body.data.pagination && fees.body.data.pagination.total;
  ok('686 fee records in DB', feeTotal === 686, 'got: ' + feeTotal);

  const summary = await req('GET', '/fees/summary', null, true);
  ok('Fee summary', summary.status === 200 && summary.body.success);
  ok('Total collected > 0', summary.body.data && summary.body.data.totalCollected > 0,
    'got: ' + (summary.body.data && summary.body.data.totalCollected));

  // ── Dashboard ─────────────────────────────────────────────────────────────
  console.log('\n📊 Dashboard / Reports API');
  const dash = await req('GET', '/reports/dashboard', null, true);
  ok('Dashboard loads', dash.status === 200 && dash.body.success);
  ok('totalStudents = 252', dash.body.data && dash.body.data.totalStudents === 252,
    'got: ' + (dash.body.data && dash.body.data.totalStudents));
  ok('totalFeeCollected > 0', dash.body.data && dash.body.data.totalFeeCollected > 0,
    'got: ' + (dash.body.data && dash.body.data.totalFeeCollected));

  // ── Import Status ─────────────────────────────────────────────────────────
  console.log('\n📥 Import Status API');
  const status = await req('GET', '/import/status', null, true);
  ok('Import status', status.status === 200 && status.body.success);
  ok('students = 252', status.body.data && status.body.data.students === 252,
    'got: ' + (status.body.data && status.body.data.students));
  ok('feeRecords = 686', status.body.data && status.body.data.feeRecords === 686,
    'got: ' + (status.body.data && status.body.data.feeRecords));

  // ── Student Login (first student) ─────────────────────────────────────────
  console.log('\n👤 Student Login');
  // Get first student rollNo
  const firstStudent = students.body.data && students.body.data.data && students.body.data.data[0];
  if (firstStudent) {
    const shortRoll = firstStudent.rollNo.split('-').pop(); // e.g. "201" from "C-1-201"
    const sLogin = await req('POST', '/auth/student/login', { rollNo: shortRoll, password: shortRoll });
    ok('Student login with short rollNo', sLogin.status === 200 && sLogin.body.success,
      JSON.stringify(sLogin.body).slice(0, 120));
  } else {
    ok('Student login (no student found)', false, 'no students returned');
  }

  // ── Attendance ────────────────────────────────────────────────────────────
  console.log('\n📅 Attendance API');
  const att = await req('GET', '/attendance/students', null, true);
  ok('Attendance endpoint', att.status === 200 && att.body.success);
  const today = await req('GET', '/attendance/today', null, true);
  ok('Today summary', today.status === 200 && today.body.success);

  // ── Announcements ─────────────────────────────────────────────────────────
  console.log('\n📢 Announcements API');
  const ann = await req('GET', '/announcements', null, true);
  ok('Announcements list', ann.status === 200 && ann.body.success);

  // ── Accounts ─────────────────────────────────────────────────────────────
  console.log('\n🧾 Accounts API');
  const accs = await req('GET', '/accounts/entries', null, true);
  ok('Account entries', accs.status === 200 && accs.body.success);
  const bs = await req('GET', '/accounts/balance-sheet', null, true);
  ok('Balance sheet', bs.status === 200 && bs.body.success);

  // ── Library ───────────────────────────────────────────────────────────────
  console.log('\n📖 Library API');
  const books = await req('GET', '/library/books', null, true);
  ok('Books list', books.status === 200 && books.body.success);

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  RESULTS: ' + pass + ' passed, ' + fail + ' failed');
  console.log('═══════════════════════════════════════════════════════\n');
  if (fail > 0) process.exit(1);
}

run().catch(e => { console.error('❌ Test error:', e.message); process.exit(1); });
