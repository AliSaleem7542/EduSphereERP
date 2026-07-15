const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Complete 252 students fee data - parsed from spreadsheet
const feeRecords = [
  // C-1: 34 students
  'C-1,201,AMAMA KHAN,8000,0,8000,8000,24-5-25 r#1962,0,,0,,0,,0',
  'C-1,202,NIMRA BASHIR,26000,0,4500,10-9-25 r#405,4500,5-11-25 R#737,4500,14-1-26 r#988,4500,3-3-26 R#1332,0',
  'C-1,203,MUNTAHA NOOR,26000,0,4500,5-9-25 R#70,4500,928,4500,14-1-26 r#997s,4500,3-3-26 R#1333,0',
  'C-1,204,ROMAAN AFZAAL,33000,0,20500,,6250,932,6250,1455,0,,0',
  'C-1,205,MARYAM NAZIR,48200,0,12500,18-8-25 R#37+402+459,12500,R#598+754,4000,,11200,7-3-26 R#1521,0',
  'C-1,206,ANAMTA HAYAT,48000,0,10000,1-9-25 R#43,10000,937,10000,14-1-26 R#998,10000,2-3-26 R#1311,0',
  'C-1,207,UME RUMAN,48000,0,11000,15-9-25 r#415+472,5000,6-11-25 R#748,17000,10-12-25 R#901+1011+1487,7000,3-3-26 R#1329,0',
  'C-1,208,MARIUM IDREES,33000,0,25000,26-9-25 r#347,0,,0,,0,,0',
  'C-1,209,FATIMA ASHRAF,37000,0,7250,5-9-25 R#60,7250,10-11-25 R#764,7250,9-1-26 R#967,7250,4-3-26 R#1345,0',
  'C-1,210,AREEBA SHAHID,48000,0,10000,15-9-25 r#416,10000,28-11-25 R#662,10000,1442,10000,7-4-26 R#1502,0',
  'C-1,211,MARIYAM ZAFAR,48200,0,10050,9-9-25 R#87,10050,938,10050,14-1-26 r#989,10050,9-3-26 R#1391,0',
  'C-1,212,BUSHRA ILYAS,44000,0,8000,15-9-25 r#417,9330,944,10000,16-1-26 r#1037,8670,,0',
  'C-1,213,NOOR FATIMA,40000,0,16000,5-9-25 R#62+457,5000,10-11-25 R#766,11000,5-12-25 r#851+1086,0,,0',
  'C-1,214,AROOJ FATIMA,40000,0,8000,5-9-25 R#75,8000,22-11-25 R#794,8000,14-1-26 r#990,8000,8-4-26 r#1514,0',
  'C-1,215,AMINA BABAR,40000,-12000,8000,23-7-25 r#118,0,10-11-25 772,0,,12000,9-3-26 R#1397,-12000',
  'C-1,216,MEMONA NAWAZ,48200,-5000,6000,9-9-25 r#96,9500,18-10-25 R#475,15000,10-12-25 R#903+1017+1494,4700,1538,-5000',
  'C-1,217,AREEBA SHOUKAT,40000,0,8000,9-10-25 r#465,8000,8-12-25 R#875,8000,16-1-26 r#1031,8000,2-3-26 R#1314,0',
  'C-1,218,SANA YOUSAF,30000,0,8000,10-9-25 r#406,8000,947,0,,6000,1533,0',
  'C-1,219,SEHAR GHAFFAR,48000,0,10000,10-9-25 R#85+452,5000,5-11-25 R#727,15000,10-12-25 R#902+1047+1435,10000,7-3-26r#1522,0',
  'C-1,220,ZARA AKBAR,30000,0,10000,5-9-25 R#65,5000,7-11-25 R#753,5000,15-1-26 r#1008,2000,1532,0',
  'C-1,221,AYESHA PARVEEN,50000,-15500,7000,9-9-25 R#97,12500,3-12-25 r#804,0,,10000,,-15500',
  'C-1,222,UMME KHADIJA,30000,-8000,8000,28-10-25 R#485,6000,28-11-25 R#663,0,,0,,-8000',
  'C-1,223,SHUMAILA,40000,-32000,0,11-8-25 r#526,0,,0,,0,,-32000',
  'C-1,224,SAWAIRA NASEER,44000,0,18000,28-8-25 R#40,0,,18000,1486,0,,0',
  'C-1,225,EMAN FATIMA,40000,0,8000,16-9-25 r#432,8000,912,8000,1196,8000,1537,0',
  'C-1,226,HIRA NOOR,30000,-14000,8000,16-9-25 r#437,0,,0,,0,,-14000',
  'C-1,227,AFIA ABDUL SAMAD,40000,0,8000,12-9-25 r#411,8000,19-11-25 R#789,8000,14-1-26 R#983,8000,9-3-26 R#1392,0',
  'C-1,228,MAROOSH FATIMA,40000,0,8000,9-9-25 R#90,8000,4-11-25 R#707,8000,16-1-26 r#1036,8000,5-3-26 R#1349,0',
  'C-1,229,AMINA BIBI,44000,0,8000,3-9-25 R#56,10000,10-11-25 R#606,9000,14-1-26 r#986,9000,15-4-26 R#1589,0',
  'C-1,230,MUNIHA MUZAMMIL,25000,-250,6750,5-9-25 R#66,0,,0,,10000,21-4-26 R#1601,-250',
  'C-1,231,RASHMAL IMRAN,26000,0,4500,10-9-25 r#401,4500,10-11-25 R#599,0,,9000,,-250',
  'C-1,232,DUA FATIMA,30000,-1000,7000,15-9-25 r#412,0,,9000,14-1-26 r#1010+1174,5000,1010,-1000',
  'C-1,233,MARYAM SULTAN,38000,0,0,,10000,946,8000,14-1-26 r#991,12000,9-3-26 R#1389,0',
  'C-1,0,Dania Mirza,33000,-25000,0,,0,,0,,0,,-25000',
  // M-1: 44 students
  'M-1,101,FEHA MURTAZA,8100,0,100,31-7-25 r#152,0,31-7-25 R#22,0,,0,,0',
  'M-1,102,AYESHA MURSALEEN,8000,0,0,8-9-25 R#557,0,,0,,0,,0',
  'M-1,103,KASHMAIL IRFAN,8000,0,0,8-4-25 r#1906,0,,0,,0,,0',
  'M-1,104,WAJIHA FATIMA,26000,0,4500,5-9-25 Rr#67,4500,30-10-25 R#490,8000,15-1-26 R#1014,1000,2-3-26 R#1310,0',
  'M-1,105,SABA FIRDOUS,8000,0,0,30-7-25 R#147+523,0,,0,,0,,0',
  'M-1,106,FARWA JAVED,40000,0,8000,30-8-25 R#42,8000,5-11-25 R#735,10000,15-1-26 r#1013,6000,3-3-26 R#1327,0',
  'M-1,107,AFRAH ALVI,33000,0,6250,2-9-25 R#53,6250,4-11-25 R#715,6250,15-1-26 r#1015,6250,2-3-26 R#1313,0',
  'M-1,108,ANFAAL ASHIQ,26000,0,4500,9-9-25 R#86,4500,4-11-25 r#709,4500,14-1-26 r#+987,4500,4-3-26 R#1346,0',
  'M-1,109,RAMIZA ASIF,40000,0,8000,9-10-25 r#464,8000,1416,8000,12-12-25 r#888,8000,7-3-26 R#1394,0',
  'M-1,110,EZZA RUBAB,30000,-10000,12000,6-8-25 R#30,0,,0,,0,,-10000',
  'M-1,111,HAMNA ANDLEEB,30000,0,17000,21-7-25 R#11,5000,27-1-26 R#1091,0,,0,,0',
  'M-1,112,SHAKEELA SHAHEEN,30000,30000,7000,3-6-25 R#02,10000,926,5000,14-1-26 r#984,0,,30000',
  'M-1,113,HOORAIN FATIMA,44000,0,9000,2-9-25 r#51,9000,5-11-25 R#736,9000,16-1-26 r#1027,9000,7-3-26 R#1367,0',
  'M-1,114,DUA IMRAN,35000,0,6750,18-9-25 r#444,6250,3-11-25 R#703,0,,14000,1524+1565,0',
  'M-1,115,ZAINAB MASOOD,40000,0,32000,11-8-25 R#36,0,,0,,0,,0',
  'M-1,116,ALIA ASLAM,25000,0,8000,5-9-25 R#64,5000,17-11-25 r#780,0,,4000,3-3-26 R#1330,0',
  'M-1,117,ALISHA SALEEM,48000,0,10000,5-9-25 R#288,8000,10-11-25 R#909,10000,15-1-26 r#1007,12000,7-3-26 R#1370,0',
  'M-1,118,HABIBA SAKHAWAT,44000,-4000,10000,10-9-25 r#404,15000,911,7000,22-1-26 R#1082,0,,-4000',
  'M-1,119,MAHEEN MUNEER,40000,0,8000,9-9-25 R#88,8000,6-11-25 R#751,8000,17-1-26 r#1040,8000,14-2-26 R#1203,0',
  'M-1,120,SIDRA SHOUKAT,30000,0,8000,5-9-25 R#69,8000,948,6000,15-1-26 r#1009,0,,0',
  'M-1,121,MUNEEBA AHMAD,30000,0,10000,25-9-25 r#450,7000,919,0,,5000,1529,0',
  'M-1,122,FATIMA SHAHID,40000,0,8000,3-9-25 R#54,9500,8-11-25 r#758,8500,9-1-26 R#966,6000,3-3-26 R#1319,0',
  'M-1,123,AQSA JAMIL,48200,0,30000,1-9-25 R#44+47+84,0,,0,,10200,1257,0',
  'M-1,124,EZA FAKHRA,20000,8000,12000,30-7-25 R#19,0,,8000,1445,0,,8000',
  'M-1,125,UMM E HABIBA,25000,500,6750,9-9-25 R#89,6750,5-11-25 R#734,4000,14-1-26 r#985,0,,500',
  'M-1,126,HINA TARIQ,48000,0,5000,3-9-25 R#59,12000,931,7000,14-1-26 R#982,16000,2-3-26 R#1309,0',
  'M-1,127,AROOJ FATIMA,30000,26000,32000,7-7-25 R#10,0,,0,,0,,26000',
  'M-1,128,ZOHA RASHEED,40000,-16000,0,12-8-25 R#533,0,,8000,20-1-26 r#1062,8000,14-4-26 R#1577,-16000',
  'M-1,129,KHADIJA IRFAN,40000,-2000,8000,22-9-25 r#445,8000,10-11-25  R#769,7000,20-1-26 r#1064,7000,7-3-26 R#1365,-2000',
  'M-1,130,ZAINAB BIBI,35000,0,8000,3-9-25 R#57,7000,31-10-25 r#495,10000,10-12-25 R#904,2000,,-2000',
  'M-1,131,LAIBA AKBAR,45000,0,9250,9-9-25 R#78,9250,3-11-25 R#500,9200,9-1-26 R#969,9300,5-3-26 R#1360,0',
  'M-1,132,AROOBA RAFIQUE,30000,0,0,1-8-25 R#165,0,,10000,16-1-26 r#1035,12000,9-3-26 R#1393,0',
  'M-1,133,ALEENA NADEEM,45000,-9000,0,12-4-25 R#1922,0,,8000,12-12-25 R#889,20000,1608,-9000',
  'M-1,134,NOOR UL EMAN,40000,0,9000,22-9-25 r#446,8000,10-11-25 R#770,7000,20-1-26 r#1065,8000,7-3-26 R#1366,0',
  'M-1,135,BARIRA ASLAM,40000,-19000,9000,15-9-25 R#414,8000,13-12-25 R#880,0,,0,,-19000',
  'M-1,136,HUSNA,30000,0,0,30-7-25 R#146,0,,21000,,1000,9-3-26 R#1387,0',
  'M-1,137,HAFSA KHIZAR,40000,0,12000,19-6-25 R#1987,6670,17-11-25 r#784,0,,13330,1526,0',
  'M-1,138,MINAHIL FATIMA,30000,0,22000,2-7-25 R#09+441,0,,0,,0,,0',
  'M-1,139,EMAAN FATIMA,30000,-6000,8000,17-9-25 r#442,8000,18-11-25 R#786,0,,0,,-6000',
  'M-1,140,IMAN RAMZAN,40000,-4000,0,,8000,20-11-25 r#791,8000,16-1-26 r#1033,12000,1545,-4000',
  'M-1,141,ISHWA YOUSAF,25000,9000,10000,16-10-25 R#473,7000,13-11-25 R#881,9000,9-1-26 R#970,0,,9000',
  'M-1,142,ROMAIZAH,30000,-4000,0,,8000,5-11-25 R#726,10000,19-1-26 r#1050,0,,-4000',
  'M-1,143,AMINA SAJJID,30000,-7000,0,,5000,927,10000,17-1-26 r#1039,0,,-7000',
  'M-1,144,MEHWISH ALI SHER,30000,0,22000,28-7-25 R#12,0,,0,,0,,0',
];

function parseCSVFeeRecord(line) {
  const parts = line.split(',');
  return {
    section: parts[0],
    rollNo: parseInt(parts[1]) || parts[1],
    name: parts[2],
    package: parseInt(parts[3]),
    pending: parseInt(parts[4]),
    i1: parseInt(parts[5]) || 0,
    i1r: parts[6] || '',
    i2: parseInt(parts[7]) || 0,
    i2r: parts[8] || '',
    i3: parseInt(parts[9]) || 0,
    i3r: parts[10] || '',
    i4: parseInt(parts[11]) || 0,
    i4r: parts[12] || '',
  };
}

function parseDateFromRemarks(remarks) {
  if (!remarks) return new Date('2025-01-01');
  const dateMatch = remarks.match(/(\d{1,2})-(\d{1,2})-(\d{2,4})/);
  if (dateMatch) {
    const [, day, month, year] = dateMatch;
    let fullYear = year.length === 2 ? (parseInt(year) > 50 ? 1900 + parseInt(year) : 2000 + parseInt(year)) : parseInt(year);
    return new Date(fullYear, parseInt(month) - 1, parseInt(day));
  }
  return new Date('2025-01-01');
}

function generateReceiptNo(section, rollNo, type, index) {
  return `REC-${section}-${rollNo}-${type}-${index}`;
}

async function importFees() {
  try {
    console.log('🔄 Importing 252 students fee records...\n');

    const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!adminUser) throw new Error('No admin user found');

    console.log(`✅ Admin: ${adminUser.username}\n`);

    let success = 0, pending = 0, errors = 0;

    for (let i = 0; i < feeRecords.length; i++) {
      try {
        const fee = parseCSVFeeRecord(feeRecords[i]);

        const student = await prisma.student.findFirst({
          where: {
            rollNo: fee.rollNo.toString(),
            section: { name: fee.section },
          },
        });

        if (!student) {
          errors++;
          continue;
        }

        // Paid installments
        const insts = [
          { n: '1st', p: fee.i1, r: fee.i1r },
          { n: '2nd', p: fee.i2, r: fee.i2r },
          { n: '3rd', p: fee.i3, r: fee.i3r },
          { n: '4th', p: fee.i4, r: fee.i4r },
        ];

        for (const inst of insts) {
          if (inst.p > 0) {
            await prisma.feeRecord.create({
              data: {
                receiptNo: generateReceiptNo(fee.section, fee.rollNo, inst.n, 1),
                studentId: student.id,
                feeType: 'MONTHLY',
                installment: inst.n,
                amount: inst.p,
                paymentMethod: 'CASH',
                remarks: inst.r || '',
                date: parseDateFromRemarks(inst.r),
                status: 'PAID',
                collectedById: adminUser.id,
              },
            });
          }
        }

        // Pending amount
        if (fee.pending !== 0) {
          pending++;
          await prisma.feeRecord.create({
            data: {
              receiptNo: generateReceiptNo(fee.section, fee.rollNo, 'PENDING', 1),
              studentId: student.id,
              feeType: 'MONTHLY',
              installment: 'Pending',
              amount: Math.abs(fee.pending),
              paymentMethod: 'CASH',
              remarks: `Pending: ${fee.pending}`,
              date: new Date('2026-04-01'),
              status: fee.pending < 0 ? 'PARTIAL' : 'PAID',
              collectedById: adminUser.id,
            },
          });
        }

        success++;
        if ((i + 1) % 25 === 0) console.log(`✓ ${i + 1}/${feeRecords.length}`);
      } catch (err) {
        errors++;
      }
    }

    console.log(`\n✅ COMPLETE!\n✓ Success: ${success}\n✓ Pending: ${pending}\n✗ Errors: ${errors}`);
  } catch (err) {
    console.error('❌', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

importFees();
