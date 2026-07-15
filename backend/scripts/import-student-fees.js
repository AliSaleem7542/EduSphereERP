const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

// Parse CSV file with fee data
function parseCSV(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split('\n').slice(1); // Skip header
  
  const records = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    
    const parts = line.split(',');
    if (parts.length < 18) continue;
    
    records.push({
      section: parts[0].trim(),
      rollNo: parts[1].trim() === '0' || !parts[1].trim() ? null : parts[1].trim(),
      name: parts[2].trim(),
      pkg: parseInt(parts[7]) || 0,
      i1Amt: parseInt(parts[9]) || 0,
      i1Date: parts[10]?.trim() || '',
      i2Amt: parseInt(parts[11]) || 0,
      i2Date: parts[12]?.trim() || '',
      i3Amt: parseInt(parts[13]) || 0,
      i3Date: parts[14]?.trim() || '',
      i4Amt: parseInt(parts[15]) || 0,
      i4Date: parts[16]?.trim() || '',
      pending: parseInt(parts[17]) || 0,
    });
  }
  
  return records;
}

function parseDate(dateStr) {
  if (!dateStr || dateStr === '' || dateStr === '0') return new Date('2025-01-01');
  const match = dateStr.match(/(\d{1,2})-(\d{1,2})-(\d{2})/);
  if (match) {
    const [, day, month, year] = match;
    const fullYear = parseInt(year) > 50 ? 1900 + parseInt(year) : 2000 + parseInt(year);
    return new Date(fullYear, parseInt(month) - 1, parseInt(day));
  }
  return new Date('2025-01-01');
}

function generateReceiptNo(section, rollNo, type, index) {
  return `REC-${section}-${rollNo}-${type}-${index}`;
}

async function importFees() {
  try {
    console.log('🔄 Importing fee records for students with pending amounts...\n');
    
    const csvPath = path.join(__dirname, '../..', 'fee_records_data.csv');
    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found: ${csvPath}`);
    }
    
    console.log(`📄 Reading CSV: ${csvPath}\n`);
    const feeData = parseCSV(csvPath);
    console.log(`✅ Parsed ${feeData.length} records from CSV\n`);
    
    const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!adminUser) throw new Error('No admin user found');
    
    console.log(`✅ Using admin: ${adminUser.username}\n`);
    
    let successCount = 0;
    let errorCount = 0;
    let pendingCount = 0;
    const errors = [];
    
    for (let idx = 0; idx < feeData.length; idx++) {
      const fee = feeData[idx];
      
      // Skip students without roll numbers (special entries)
      if (!fee.rollNo) continue;
      
      try {
        // Find student
        const student = await prisma.student.findFirst({
          where: {
            rollNo: fee.rollNo,
            section: { name: fee.section },
          },
        });
        
        if (!student) {
          errors.push(`${fee.section} ${fee.rollNo} - ${fee.name}: Student not found`);
          errorCount++;
          continue;
        }
        
        // Create paid installment records
        const installments = [
          { num: '1st', amt: fee.i1Amt, date: fee.i1Date },
          { num: '2nd', amt: fee.i2Amt, date: fee.i2Date },
          { num: '3rd', amt: fee.i3Amt, date: fee.i3Date },
          { num: '4th', amt: fee.i4Amt, date: fee.i4Date },
        ];
        
        for (const inst of installments) {
          if (inst.amt && inst.amt > 0) {
            await prisma.feeRecord.create({
              data: {
                receiptNo: generateReceiptNo(fee.section, fee.rollNo, inst.num, 1),
                studentId: student.id,
                feeType: 'MONTHLY',
                installment: inst.num,
                amount: inst.amt,
                paymentMethod: 'CASH',
                remarks: inst.date || `${inst.num} Installment paid`,
                date: parseDate(inst.date),
                status: 'PAID',
                collectedById: adminUser.id,
              },
            });
          }
        }
        
        // Create pending record if outstanding
        if (fee.pending < 0) {
          pendingCount++;
          await prisma.feeRecord.create({
            data: {
              receiptNo: generateReceiptNo(fee.section, fee.rollNo, 'PENDING', 1),
              studentId: student.id,
              feeType: 'MONTHLY',
              installment: 'Pending',
              amount: Math.abs(fee.pending),
              paymentMethod: 'CASH',
              remarks: `Outstanding Balance: ${fee.pending}`,
              date: new Date('2026-04-01'),
              status: 'PARTIAL',
              collectedById: adminUser.id,
            },
          });
        }
        
        successCount++;
        if ((idx + 1) % 30 === 0) {
          console.log(`✓ Processed ${idx + 1}/${feeData.length}`);
        }
      } catch (err) {
        errors.push(`${fee.section} ${fee.rollNo}: ${err.message}`);
        errorCount++;
      }
    }
    
    console.log(`\n✅ IMPORT COMPLETE!\n`);
    console.log(`📊 SUMMARY:`);
    console.log(`   ✓ Students processed: ${successCount}`);
    console.log(`   ✓ Pending records created: ${pendingCount}`);
    console.log(`   ✗ Errors: ${errorCount}`);
    
    if (errors.length > 0) {
      console.log(`\n⚠️  Errors (showing first 15):`);
      errors.slice(0, 15).forEach(e => console.log(`   - ${e}`));
      if (errors.length > 15) {
        console.log(`   ... and ${errors.length - 15} more errors`);
      }
    }
    
  } catch (err) {
    console.error('❌ Fatal error:', err.message);
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

importFees();
