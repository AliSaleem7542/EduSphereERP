require('dotenv').config();
const http = require('http');

function req(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'localhost', port: 5000, path: '/api/v1' + path, method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const r = http.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(d) }));
    });
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

async function main() {
  // Login as admin
  const login = await req('POST', '/auth/admin/login', { username: 'admin', password: 'admin123' });
  const token = login.body.data.accessToken;

  // Get first student
  const students = await req('GET', '/students?limit=1', null, token);
  const s = students.body.data.data[0];
  console.log('First student rollNo:', s.rollNo);
  console.log('First student name:', s.firstName, s.lastName);

  // Try login with full rollNo as password
  const t1 = await req('POST', '/auth/student/login', { rollNo: s.rollNo, password: s.rollNo });
  console.log('\nLogin with full rollNo as both:', t1.status, t1.body.success ? 'OK' : t1.body.message);

  // Extract short part (last segment after last dash)
  const parts = s.rollNo.split('-');
  const shortRoll = parts[parts.length - 1];
  console.log('Short rollNo:', shortRoll);

  // Try login with short rollNo
  const t2 = await req('POST', '/auth/student/login', { rollNo: shortRoll, password: shortRoll });
  console.log('Login with short rollNo:', t2.status, t2.body.success ? 'OK' : t2.body.message);

  // Try login with short rollNo, full password
  const t3 = await req('POST', '/auth/student/login', { rollNo: shortRoll, password: s.rollNo });
  console.log('Login with short rollNo + full password:', t3.status, t3.body.success ? 'OK' : t3.body.message);
}

main().catch(e => console.error(e.message));
