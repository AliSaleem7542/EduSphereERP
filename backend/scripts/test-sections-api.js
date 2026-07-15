const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function test() {
  try {
    console.log('🧪 Testing Sections API\n');
    
    // Step 1: Login
    console.log('1️⃣ Login as admin...');
    const loginRes = await axios.post(API_BASE + '/auth/login', {
      email: 'admin@edusphere.com',
      password: 'admin123',
    });
    
    const token = loginRes.data.data.accessToken;
    console.log('✓ Login successful\n');
    
    const headers = { Authorization: `Bearer ${token}` };
    
    // Step 2: Get classes
    console.log('2️⃣ Getting all classes...');
    const classRes = await axios.get(API_BASE + '/classes', { headers });
    const classes = classRes.data.data;
    
    console.log('✓ Classes:', classes.map(c => c.name).join(', '));
    console.log('');
    
    if (classes.length === 0) {
      console.log('❌ No classes found');
      process.exit(1);
    }
    
    // Step 3: Get sections for first class
    const classId = classes[0].id;
    console.log(`3️⃣ Getting sections for class "${classes[0].name}" (ID: ${classId})...`);
    
    const sectRes = await axios.get(API_BASE + `/classes/${classId}/sections`, { headers });
    const sections = sectRes.data.data;
    
    console.log('✓ Sections found:', sections.length);
    sections.forEach(s => console.log('  - ' + s.name));
    
    if (sections.length === 0) {
      console.log('\n❌ ERROR: No sections found! Check database.');
    } else {
      console.log('\n✅ API working correctly!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
  process.exit(0);
}

test();
