const axios = require('axios');

// Test the API endpoints
async function test() {
  try {
    console.log('Starting API tests...\n');
    
    // Login first
    console.log('1. Testing login...');
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@edusphere.com',
      password: 'admin123',
    });
    
    const token = loginRes.data.data.accessToken;
    console.log('✓ Login successful, token:', token.substring(0, 20) + '...\n');
    
    // Get classes
    console.log('2. Getting classes...');
    const classRes = await axios.get('http://localhost:5000/api/classes', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✓ Classes received:', classRes.data.data.length, 'classes');
    if (classRes.data.data.length > 0) {
      const classId = classRes.data.data[0].id;
      console.log('  First class ID:', classId, '\n');
      
      // Get sections for first class
      console.log('3. Getting sections for class ' + classId + '...');
      const sectRes = await axios.get(`http://localhost:5000/api/classes/${classId}/sections`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✓ Sections received:', sectRes.data.data.length, 'sections');
      sectRes.data.data.forEach(s => console.log('  -', s.name));
    }
    
    console.log('\n✓ All tests passed!');
  } catch (error) {
    console.error('✗ Error:', error.response?.data || error.message);
  }
}

test();
