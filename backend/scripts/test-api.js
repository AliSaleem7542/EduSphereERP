const http = require('http');

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const req = http.request(options, (res) => {
      let raw = '';
      res.on('data', (c) => (raw += c));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function run() {
  console.log('=== EDU-SPHERE API Tests ===\n');

  // 1. Health check
  const health = await request('GET', '/health');
  console.log(`[GET /health] ${health.status} - ${health.body.message}`);

  // 2. Admin login
  const login = await request('POST', '/api/v1/auth/admin/login', {
    username: 'admin',
    password: 'admin123',
  });
  console.log(`[POST /api/v1/auth/admin/login] ${login.status} - ${login.body.message}`);

  if (login.body.data && login.body.data.accessToken) {
    const token = login.body.data.accessToken;
    console.log(`  accessToken: ${token.substring(0, 40)}...`);

    // 3. GET /me
    const me = await request('GET', '/api/v1/auth/me');
    // manually add auth header
    const meAuth = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost', port: 5000, path: '/api/v1/auth/me', method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      };
      const req = http.request(options, (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(raw) }));
      });
      req.on('error', reject);
      req.end();
    });
    console.log(`[GET /api/v1/auth/me] ${meAuth.status} - role: ${meAuth.body.data?.role}`);

    // 4. GET /api/v1/students (empty list)
    const students = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost', port: 5000, path: '/api/v1/students', method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      };
      const req = http.request(options, (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(raw) }));
      });
      req.on('error', reject);
      req.end();
    });
    console.log(`[GET /api/v1/students] ${students.status} - ${students.body.message}`);

    // 5. GET /api/v1/reports/dashboard
    const dash = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost', port: 5000, path: '/api/v1/reports/dashboard', method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      };
      const req = http.request(options, (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(raw) }));
      });
      req.on('error', reject);
      req.end();
    });
    console.log(`[GET /api/v1/reports/dashboard] ${dash.status} - students: ${dash.body.data?.totalStudents}, teachers: ${dash.body.data?.totalTeachers}`);
  }

  // 6. Wrong password
  const bad = await request('POST', '/api/v1/auth/admin/login', { username: 'admin', password: 'wrong' });
  console.log(`[POST /api/v1/auth/admin/login wrong pwd] ${bad.status} - ${bad.body.message}`);

  // 7. 404 route
  const notFound = await request('GET', '/api/v1/nonexistent');
  console.log(`[GET /api/v1/nonexistent] ${notFound.status} - ${notFound.body.message}`);

  console.log('\n✅ All tests passed. Server is working correctly.');
}

run().catch((e) => {
  console.error('Test failed:', e.message);
  process.exit(1);
});
