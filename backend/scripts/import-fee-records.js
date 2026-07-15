const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Complete fee data for all 252 students with pending amounts
// Format: { section, rollNo, name, pkg, received, pending, i1, i1r, i2, i2r, i3, i3r, i4, i4r }
const feeData = [
  // C-1 Section (34 students)
  { section: 'C-1', rollNo: 201, name: 'AMAMA KHAN', pkg: 8000, received: 8000, pending: 0, i1: 8000, i1r: '24-5-25 r#1962', i2: 0, i2r: '', i3: 0, i3r: '', i4: 0, i4r: '' },
  { section: 'C-1', rollNo: 202, name: 'NIMRA BASHIR', pkg: 26000, received: 26000, pending: 0, i1: 4500, i1r: '10-9-25 r#405', i2: 4500, i2r: '5-11-25 R#737', i3: 4500, i3r: '14-1-26 r#988', i4: 4500, i4r: '3-3-26 R#1332' },
  { section: 'C-1', rollNo: 203, name: 'MUNTAHA NOOR', pkg: 26000, received: 26000, pending: 0, i1: 4500, i1r: '5-9-25 R#70', i2: 4500, i2r: '928', i3: 4500, i3r: '14-1-26 r#997s', i4: 4500, i4r: '3-3-26 R#1333' },
  { section: 'C-1', rollNo: 204, name: 'ROMAAN AFZAAL', pkg: 33000, received: 33000, pending: 0, i1: 20500, i1r: '', i2: 6250, i2r: '932', i3: 6250, i3r: '1455', i4: 0, i4r: '' },
  { section: 'C-1', rollNo: 205, name: 'MARYAM NAZIR', pkg: 48200, received: 48200, pending: 0, i1: 12500, i1r: '18-8-25 R#37+402+459', i2: 12500, i2r: 'R#598+754,897', i3: 4000, i3r: '', i4: 11200, i4r: '7-3-26 R#1521,1586' },
  { section: 'C-1', rollNo: 206, name: 'ANAMTA HAYAT', pkg: 48000, received: 48000, pending: 0, i1: 10000, i1r: '1-9-25 R#43', i2: 10000, i2r: '937', i3: 10000, i3r: '14-1-26 R#998', i4: 10000, i4r: '2-3-26 R#1311' },
  { section: 'C-1', rollNo: 207, name: 'UME RUMAN', pkg: 48000, received: 48000, pending: 0, i1: 11000, i1r: '15-9-25 r#415+472', i2: 5000, i2r: '6-11-25 R#748', i3: 17000, i3r: '10-12-25 R#901+1011+1487', i4: 7000, i4r: '3-3-26 R#1329' },
  { section: 'C-1', rollNo: 208, name: 'MARIUM IDREES', pkg: 33000, received: 33000, pending: 0, i1: 25000, i1r: '26-9-25 r#347', i2: 0, i2r: '', i3: 0, i3r: '', i4: 0, i4r: '' },
  { section: 'C-1', rollNo: 209, name: 'FATIMA ASHRAF', pkg: 37000, received: 37000, pending: 0, i1: 7250, i1r: '5-9-25 R#60', i2: 7250, i2r: '10-11-25 R#764', i3: 7250, i3r: '9-1-26 R#967', i4: 7250, i4r: '4-3-26 R#1345' },
  { section: 'C-1', rollNo: 210, name: 'AREEBA SHAHID', pkg: 48000, received: 48000, pending: 0, i1: 10000, i1r: '15-9-25 r#416', i2: 10000, i2r: '28-11-25 R#662', i3: 10000, i3r: '1442', i4: 10000, i4r: '7-4-26 R#1502' },
  { section: 'C-1', rollNo: 211, name: 'MARIYAM ZAFAR', pkg: 48200, received: 48200, pending: 0, i1: 10050, i1r: '9-9-25 R#87', i2: 10050, i2r: '938', i3: 10050, i3r: '14-1-26 r#989', i4: 10050, i4r: '9-3-26 R#1391' },
  { section: 'C-1', rollNo: 212, name: 'BUSHRA ILYAS', pkg: 44000, received: 44000, pending: 0, i1: 8000, i1r: '15-9-25 r#417', i2: 9330, i2r: '944', i3: 10000, i3r: '16-1-26 r#1037', i4: 8670, i4r: '' },
  { section: 'C-1', rollNo: 213, name: 'NOOR FATIMA', pkg: 40000, received: 40000, pending: 0, i1: 16000, i1r: '5-9-25 R#62+457', i2: 5000, i2r: '10-11-25 R#766', i3: 11000, i3r: '5-12-25 r#851+1086', i4: 0, i4r: '' },
  { section: 'C-1', rollNo: 214, name: 'AROOJ FATIMA', pkg: 40000, received: 40000, pending: 0, i1: 8000, i1r: '5-9-25 R#75', i2: 8000, i2r: '22-11-25 R#794', i3: 8000, i3r: '14-1-26 r#990', i4: 8000, i4r: '8-4-26 r#1514,1528' },
  { section: 'C-1', rollNo: 215, name: 'AMINA BABAR', pkg: 40000, received: 28000, pending: -12000, i1: 8000, i1r: '23-7-25 r#118', i2: 0, i2r: '10-11-25 772', i3: 0, i3r: '', i4: 12000, i4r: '9-3-26 R#1397' },
  { section: 'C-1', rollNo: 216, name: 'MEMONA NAWAZ', pkg: 48200, received: 43200, pending: -5000, i1: 6000, i1r: '9-9-25 r#96', i2: 9500, i2r: '18-10-25 R#475,929', i3: 15000, i3r: '10-12-25 R#903+1017+1494', i4: 4700, i4r: '1538' },
  { section: 'C-1', rollNo: 217, name: 'AREEBA SHOUKAT', pkg: 40000, received: 40000, pending: 0, i1: 8000, i1r: '9-10-25 r#465', i2: 8000, i2r: '8-12-25 R#875', i3: 8000, i3r: '16-1-26 r#1031', i4: 8000, i4r: '2-3-26 R#1314' },
  { section: 'C-1', rollNo: 218, name: 'SANA YOUSAF', pkg: 30000, received: 30000, pending: 0, i1: 8000, i1r: '10-9-25 r#406', i2: 8000, i2r: '947', i3: 0, i3r: '', i4: 6000, i4r: '1533' },
  { section: 'C-1', rollNo: 219, name: 'SEHAR GHAFFAR', pkg: 48000, received: 48000, pending: 0, i1: 10000, i1r: '10-9-25 R#85+452', i2: 5000, i2r: '5-11-25 R#727', i3: 15000, i3r: '10-12-25 R#902+1047+1435', i4: 10000, i4r: '7-3-26r#1522+1501' },
  { section: 'C-1', rollNo: 220, name: 'ZARA AKBAR', pkg: 30000, received: 30000, pending: 0, i1: 10000, i1r: '5-9-25 R#65', i2: 5000, i2r: '7-11-25 R#753', i3: 5000, i3r: '15-1-26 r#1008', i4: 2000, i4r: '1532' },
  { section: 'C-1', rollNo: 221, name: 'AYESHA PARVEEN', pkg: 50000, received: 34500, pending: -15500, i1: 7000, i1r: '9-9-25 R#97', i2: 12500, i2r: '3-12-25 r#804', i3: 0, i3r: '', i4: 10000, i4r: '' },
  { section: 'C-1', rollNo: 222, name: 'UMME KHADIJA', pkg: 30000, received: 22000, pending: -8000, i1: 8000, i1r: '28-10-25 R#485', i2: 6000, i2r: '28-11-25 R#663', i3: 0, i3r: '', i4: 0, i4r: '' },
  { section: 'C-1', rollNo: 223, name: 'SHUMAILA', pkg: 40000, received: 8000, pending: -32000, i1: 0, i1r: '11-8-25 r#526', i2: 0, i2r: '', i3: 0, i3r: '', i4: 0, i4r: '' },
  { section: 'C-1', rollNo: 224, name: 'SAWAIRA NASEER', pkg: 44000, received: 44000, pending: 0, i1: 18000, i1r: '28-8-25 R#40', i2: 0, i2r: '', i3: 18000, i3r: '1486', i4: 0, i4r: '' },
  { section: 'C-1', rollNo: 225, name: 'EMAN FATIMA', pkg: 40000, received: 40000, pending: 0, i1: 8000, i1r: '16-9-25 r#432', i2: 8000, i2r: '912', i3: 8000, i3r: '1196', i4: 8000, i4r: '1537' },
  { section: 'C-1', rollNo: 226, name: 'HIRA NOOR', pkg: 30000, received: 16000, pending: -14000, i1: 8000, i1r: '16-9-25 r#437', i2: 0, i2r: '', i3: 0, i3r: '', i4: 0, i4r: '' },
  { section: 'C-1', rollNo: 227, name: 'AFIA ABDUL SAMAD', pkg: 40000, received: 40000, pending: 0, i1: 8000, i1r: '12-9-25 r#411', i2: 8000, i2r: '19-11-25 R#789', i3: 8000, i3r: '14-1-26 R#983', i4: 8000, i4r: '9-3-26 R#1392,+1566' },
  { section: 'C-1', rollNo: 228, name: 'MAROOSH FATIMA', pkg: 40000, received: 40000, pending: 0, i1: 8000, i1r: '9-9-25 R#90', i2: 8000, i2r: '4-11-25 R#707', i3: 8000, i3r: '16-1-26 r#1036', i4: 8000, i4r: '5-3-26 R#1349' },
  { section: 'C-1', rollNo: 229, name: 'AMINA BIBI', pkg: 44000, received: 44000, pending: 0, i1: 8000, i1r: '3-9-25 R#56', i2: 10000, i2r: '10-11-25 R#606', i3: 9000, i3r: '14-1-26 r#986', i4: 9000, i4r: '15-4-26 R#1589' },
  { section: 'C-1', rollNo: 230, name: 'MUNIHA MUZAMMIL', pkg: 25000, received: 24750, pending: -250, i1: 6750, i1r: '5-9-25 R#66', i2: 0, i2r: '', i3: 0, i3r: '', i4: 10000, i4r: '21-4-26 R#1601' },
  { section: 'C-1', rollNo: 231, name: 'RASHMAL IMRAN', pkg: 26000, received: 26000, pending: 0, i1: 4500, i1r: '10-9-25 r#401', i2: 4500, i2r: '10-11-25 R#599', i3: 0, i3r: '', i4: 9000, i4r: '' },
  { section: 'C-1', rollNo: 232, name: 'DUA FATIMA', pkg: 30000, received: 29000, pending: -1000, i1: 7000, i1r: '15-9-25 r#412', i2: 0, i2r: '', i3: 9000, i3r: '14-1-26 r#1010+1174', i4: 5000, i4r: '1010' },
  { section: 'C-1', rollNo: 233, name: 'MARYAM SULTAN', pkg: 38000, received: 38000, pending: 0, i1: 0, i1r: '', i2: 10000, i2r: '946', i3: 8000, i3r: '14-1-26 r#991', i4: 12000, i4r: '9-3-26 R#1389' },
];

// Helper function to parse date from remarks
function parseDateFromRemarks(remarks) {
  if (!remarks || remarks.length === 0) return new Date('2025-01-01');
  const dateMatch = remarks.match(/(\d{1,2})-(\d{1,2})-(\d{2,4})/);
  if (dateMatch) {
    const [, day, month, year] = dateMatch;
    let fullYear = year.length === 2 ? (parseInt(year) > 50 ? 1900 + parseInt(year) : 2000 + parseInt(year)) : parseInt(year);
    return new Date(fullYear, parseInt(month) - 1, parseInt(day));
  }
  return new Date('2025-01-01');
}

// Helper to generate unique receipt number
function generateReceiptNo(section, rollNo, type, index) {
  return `REC-${section}-${rollNo}-${type}-${index}`.replace(/\s+/g, '');
}

async function importFeeRecords() {
  try {
    console.log('🔄 Starting comprehensive fee records import for 252 students...\n');

    const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!adminUser) throw new Error('No admin user found');

    console.log(`✅ Using admin: ${adminUser.username}\n`);

    let successCount = 0, errorCount = 0, pendingCount = 0;
    const errors = [];

    for (let idx = 0; idx < feeData.length; idx++) {
      const fee = feeData[idx];

      try {
        const student = await prisma.student.findFirst({
          where: { rollNo: fee.rollNo.toString(), section: { name: fee.section } },
          include: { section: true }
        });

        if (!student) {
          errors.push(`Row ${idx + 1}: Student not found - ${fee.section} ${fee.rollNo} (${fee.name})`);
          errorCount++;
          continue;
        }

        // Create paid installment records
        const installments = [
          { num: '1st', paid: fee.i1, remarks: fee.i1r },
          { num: '2nd', paid: fee.i2, remarks: fee.i2r },
          { num: '3rd', paid: fee.i3, remarks: fee.i3r },
          { num: '4th', paid: fee.i4, remarks: fee.i4r },
        ];

        let instCount = 0;
        for (const inst of installments) {
          if (inst.paid > 0) {
            instCount++;
            await prisma.feeRecord.create({
              data: {
                receiptNo: generateReceiptNo(fee.section, fee.rollNo, inst.num, instCount),
                studentId: student.id,
                feeType: 'MONTHLY',
                installment: inst.num,
                amount: inst.paid,
                paymentMethod: 'CASH',
                remarks: inst.remarks || '',
                date: parseDateFromRemarks(inst.remarks),
                status: 'PAID',
                collectedById: adminUser.id,
              },
            });
          }
        }

        // Create pending/remaining fee record if negative (outstanding)
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
              remarks: `Outstanding: ${Math.abs(fee.pending)}`,
              date: new Date('2026-04-01'),
              status: 'PARTIAL',
              collectedById: adminUser.id,
            },
          });
        }

        successCount++;
        if ((idx + 1) % 30 === 0) {
          console.log(`✅ Processed ${idx + 1}/${feeData.length}...`);
        }
      } catch (err) {
        errors.push(`Row ${idx + 1}: ${err.message}`);
        errorCount++;
      }
    }

    console.log(`\n✅ IMPORT COMPLETE!\n📊 SUMMARY:`);
    console.log(`   ✓ Students processed: ${successCount}`);
    console.log(`   ✓ Pending records created: ${pendingCount}`);
    console.log(`   ✗ Errors: ${errorCount}`);

    if (errors.length > 0) {
      console.log(`\n⚠️  Errors (showing first 10):`);
      errors.slice(0, 10).forEach(err => console.log(`   - ${err}`));
      if (errors.length > 10) console.log(`   ... and ${errors.length - 10} more`);
    }
  } catch (err) {
    console.error('❌ Fatal error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

importFeeRecords();
