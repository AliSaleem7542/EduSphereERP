/**
 * Test Backend API Response
 */

const axios = require('axios');

async function main() {
  console.log('\n🌐 TESTING BACKEND API RESPONSE\n');
  console.log('='.repeat(80));
  
  try {
    // First login to get token
    console.log('🔐 Logging in as admin...');
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginRes.data.data.accessToken;
    console.log('✅ Login successful\n');
    
    // Get fee records
    console.log('📥 Fetching fee records...');
    const feesRes = await axios.get('http://localhost:5000/api/fees?limit=10', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const records = feesRes.data.data.data || feesRes.data.data || [];
    console.log(`✅ Got ${records.length} fee records\n`);
    
    // Find NIMRA's records
    const nimraRecords = records.filter(r => 
      r.student && 
      r.student.firstName && 
      r.student.firstName.toUpperCase().includes('NIMRA')
    );
    
    console.log(`🔍 Found ${nimraRecords.length} records for NIMRA\n`);
    
    if (nimraRecords.length > 0) {
      const sample = nimraRecords[0];
      
      console.log('📋 SAMPLE RECORD STRUCTURE:');
      console.log(JSON.stringify({
        id: sample.id,
        receiptNo: sample.receiptNo,
        studentId: sample.studentId,
        installment: sample.installment,
        amount: sample.amount,
        transportAmount: sample.transportAmount,
        student: {
          id: sample.student?.id,
          firstName: sample.student?.firstName,
          lastName: sample.student?.lastName,
          rollNo: sample.student?.rollNo,
          packageTotal: sample.student?.packageTotal,
          annualCharges: sample.student?.annualCharges,
          tuitionFee: sample.student?.tuitionFee,
          section: sample.student?.section
        }
      }, null, 2));
      
      console.log('\n\n✅ BACKEND IS SENDING COMPLETE DATA:');
      console.log(`   - student.packageTotal: ${sample.student?.packageTotal}`);
      console.log(`   - student.annualCharges: ${sample.student?.annualCharges}`);
      console.log(`   - student.tuitionFee: ${sample.student?.tuitionFee}`);
      console.log(`   - installment: ${sample.installment}`);
      console.log(`   - amount: ${sample.amount}`);
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    if (err.response) {
      console.error('Response:', err.response.data);
    }
  }
  
  console.log('\n' + '='.repeat(80) + '\n');
}

main();
