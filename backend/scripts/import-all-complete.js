require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// COMPLETE STUDENT DATA - ALL SECTIONS
const studentsData = [
  // C-1 Section (33 students)
  { rollNo: '201', name: 'AMAN KHAN', section: 'C-1', gender: 'FEMALE', fatherName: 'RANA TASLEEM', phone: '033366997' },
  { rollNo: '202', name: 'NIMRA BASHIR', section: 'C-1', gender: 'FEMALE', fatherName: 'BASHIR AHMAD ZAHID', phone: '03408653449' },
  { rollNo: '203', name: 'MUNTAHA NOOR', section: 'C-1', gender: 'FEMALE', fatherName: 'MUHAMMAD RIZWAN', phone: '03187018942' },
  { rollNo: '204', name: 'ROMAAN AFZAAL', section: 'C-1', gender: 'FEMALE', fatherName: 'MUHAMMAD AFZAAL', phone: '03036227655' },
  { rollNo: '205', name: 'MARYAM NAZIR', section: 'C-1', gender: 'FEMALE', fatherName: 'NAZIR AHMAD', phone: '03007667564' },
  { rollNo: '206', name: 'ANAMTA HAYAT', section: 'C-1', gender: 'FEMALE', fatherName: 'MUHAMMAD HAYAT KHAN', phone: '03134690929' },
  { rollNo: '207', name: 'UME RUMAN', section: 'C-1', gender: 'FEMALE', fatherName: 'SHAHID ALI', phone: '' },
  { rollNo: '208', name: 'MARIUM IDREES', section: 'C-1', gender: 'FEMALE', fatherName: 'IDREES AHMED', phone: '' },
  { rollNo: '209', name: 'FATIMA ASHRAF', section: 'C-1', gender: 'FEMALE', fatherName: 'MUHAMMAD ASHRAF', phone: '03026004748' },
  { rollNo: '210', name: 'AREEBA SHAHID', section: 'C-1', gender: 'FEMALE', fatherName: 'SHAHID ALI', phone: '03167571109' },
  { rollNo: '211', name: 'MARIYAM ZAFAR', section: 'C-1', gender: 'FEMALE', fatherName: 'ZAFAR ALI', phone: '03446962377' },
  { rollNo: '212', name: 'BUSHRA ILYAS', section: 'C-1', gender: 'FEMALE', fatherName: 'MUHAMMAD ILYAS', phone: '03427817465' },
  { rollNo: '213', name: 'NOOR FATIMA', section: 'C-1', gender: 'FEMALE', fatherName: 'AZIZULLAH', phone: '03240849615' },
  { rollNo: '214', name: 'AROOJ FATIMA', section: 'C-1', gender: 'FEMALE', fatherName: 'KASHIF LATIF', phone: '03067909875' },
  { rollNo: '215', name: 'AMINA BABAR', section: 'C-1', gender: 'FEMALE', fatherName: 'BABAR IFTIKHAR', phone: '03064849043' },
  { rollNo: '216', name: 'MEMONA NAWAZ', section: 'C-1', gender: 'FEMALE', fatherName: 'MUHAMMAD NAWAZ', phone: '03007912269' },
  { rollNo: '217', name: 'AREEBA SHOUKAT', section: 'C-1', gender: 'FEMALE', fatherName: 'SHOUKAT ALI', phone: '03177030465' },
  { rollNo: '218', name: 'SANA YOUSAF', section: 'C-1', gender: 'FEMALE', fatherName: 'YOUSAF', phone: '03447635457' },
  { rollNo: '219', name: 'SEHAR GHAFFAR', section: 'C-1', gender: 'FEMALE', fatherName: 'ABDUL GHAFFAR', phone: '' },
  { rollNo: '220', name: 'ZARA AKBAR', section: 'C-1', gender: 'FEMALE', fatherName: 'MUHAMMAD AKBAR', phone: '03349666605' },
  { rollNo: '221', name: 'AYESHA PARVEEN', section: 'C-1', gender: 'FEMALE', fatherName: 'MUHAMMAD ASIF', phone: '03004677141' },
  { rollNo: '222', name: 'UMME KHADIJA', section: 'C-1', gender: 'FEMALE', fatherName: 'MUMTAZ ALI', phone: '03128347080' },
  { rollNo: '223', name: 'SHUMAILA', section: 'C-1', gender: 'FEMALE', fatherName: 'ABDUL MAJEED', phone: '03074671122' },
  { rollNo: '224', name: 'SAWAIRA NASEER', section: 'C-1', gender: 'FEMALE', fatherName: 'NASEER AHMAD', phone: '03047257635' },
  { rollNo: '225', name: 'EMAN FATIMA', section: 'C-1', gender: 'FEMALE', fatherName: 'SABIR HUSSAIN', phone: '03473418404' },
  { rollNo: '226', name: 'HIRA NOOR', section: 'C-1', gender: 'FEMALE', fatherName: 'ZULFIQAR ALI', phone: '03368649732' },
  { rollNo: '227', name: 'AFIA ABDUL SAMAD', section: 'C-1', gender: 'FEMALE', fatherName: 'ABDUL SAMAD', phone: '03067030336' },
  { rollNo: '228', name: 'MAROOSH FATIMA', section: 'C-1', gender: 'FEMALE', fatherName: 'JAFIR IQBAL', phone: '03291015016' },
  { rollNo: '229', name: 'AMINA BIBI', section: 'C-1', gender: 'FEMALE', fatherName: 'MUHAMMAD BINYAMEEN', phone: '03281695390' },
  { rollNo: '230', name: 'MUNIHA MUZAMMIL', section: 'C-1', gender: 'FEMALE', fatherName: 'MUZAMMIL', phone: '03441777009' },
  { rollNo: '231', name: 'RASHMAL IMRAN', section: 'C-1', gender: 'FEMALE', fatherName: 'IMRAN SHARIF', phone: '03089156114' },
  { rollNo: '232', name: 'DUA FATIMA', section: 'C-1', gender: 'FEMALE', fatherName: 'RAO MUJAHID', phone: '03267126519' },
  { rollNo: '233', name: 'MARYAM SULTAN', section: 'C-1', gender: 'FEMALE', fatherName: 'SULTAN MEHMOOD', phone: '03060668192' },

  // M-1 Section (44 students)
  { rollNo: '101', name: 'FEHA MURTAZA', section: 'M-1', gender: 'FEMALE', fatherName: 'GHULAM MURTAZA', phone: '03049144847' },
  { rollNo: '102', name: 'AYESHA MURSALEEN', section: 'M-1', gender: 'FEMALE', fatherName: 'M MURSALEEN', phone: '03000797136' },
  { rollNo: '103', name: 'KASHMAIL IRFAN', section: 'M-1', gender: 'FEMALE', fatherName: 'MUHAMMAD IRFAN', phone: '03056058124' },
  { rollNo: '104', name: 'WAJIHA FATIMA', section: 'M-1', gender: 'FEMALE', fatherName: 'TOUQEER AHMAD', phone: '03070334500' },
  { rollNo: '105', name: 'SABA FIRDOUS', section: 'M-1', gender: 'FEMALE', fatherName: 'MUHAMMAD SARDAR', phone: '03026096345' },
  { rollNo: '106', name: 'FARWA JAVED', section: 'M-1', gender: 'FEMALE', fatherName: 'JAVED IQBAL', phone: '03004847918' },
  { rollNo: '107', name: 'AFRAH ALVI', section: 'M-1', gender: 'FEMALE', fatherName: 'MUHAMMAD YASIR ALVI', phone: '03291852390' },
  { rollNo: '108', name: 'ANFAAL ASHIQ', section: 'M-1', gender: 'FEMALE', fatherName: 'ASHIQ ALI', phone: '03451888218' },
  { rollNo: '109', name: 'RAMIZA ASIF', section: 'M-1', gender: 'FEMALE', fatherName: 'ASIF ALI', phone: '03057462290' },
  { rollNo: '110', name: 'EZZA RUBAB', section: 'M-1', gender: 'FEMALE', fatherName: 'TASAWAR ABBAS', phone: '03476725453' },
  { rollNo: '111', name: 'HAMNA ANDLEEB', section: 'M-1', gender: 'FEMALE', fatherName: 'MUHAMMAD MAJIDULLAH', phone: '' },
  { rollNo: '112', name: 'SHAKEELA SHAHEEN', section: 'M-1', gender: 'FEMALE', fatherName: 'MUHAMMAD MANSHA', phone: '03705291601' },
  { rollNo: '113', name: 'HOORAIN FATIMA', section: 'M-1', gender: 'FEMALE', fatherName: 'MUHAMMAD NASEEM', phone: '03221560460' },
  { rollNo: '114', name: 'DUA IMRAN', section: 'M-1', gender: 'FEMALE', fatherName: 'IMRAN SARWAR', phone: '03007286740' },
  { rollNo: '115', name: 'ZAINAB MASOOD', section: 'M-1', gender: 'FEMALE', fatherName: 'MASOOD', phone: '03009411502' },
  { rollNo: '116', name: 'ALIA ASLAM', section: 'M-1', gender: 'FEMALE', fatherName: 'MUHAMMAD ASLAM', phone: '03476497543' },
  { rollNo: '117', name: 'ALISHA SALEEM', section: 'M-1', gender: 'FEMALE', fatherName: 'MUHAMMAD SALEEM', phone: '03067699589' },
  { rollNo: '118', name: 'HABIBA SAKHAWAT', section: 'M-1', gender: 'FEMALE', fatherName: 'SAKHAWAT ALI', phone: '03041368442' },
  { rollNo: '119', name: 'MAHEEN MUNEER', section: 'M-1', gender: 'FEMALE', fatherName: 'MUNEER', phone: '03241528142' },
  { rollNo: '120', name: 'SIDRA SHOUKAT', section: 'M-1', gender: 'FEMALE', fatherName: 'SHOUKAT ALI', phone: '03187074228' },
  { rollNo: '121', name: 'MUNEEBA AHMAD', section: 'M-1', gender: 'FEMALE', fatherName: 'AHMAD HAYAT', phone: '03003915547' },
  { rollNo: '122', name: 'FATIMA SHAHID', section: 'M-1', gender: 'FEMALE', fatherName: 'MUHAMMAD SHAHID PARVAIZ', phone: '03017125415' },
  { rollNo: '123', name: 'AQSA JAMIL', section: 'M-1', gender: 'FEMALE', fatherName: 'MUHAMMAD JAMIL', phone: '03320666820' },
  { rollNo: '124', name: 'EZA FAKHRA', section: 'M-1', gender: 'FEMALE', fatherName: 'GHULAM HUSSAIN', phone: '03457909453' },
  { rollNo: '125', name: 'UMM E HABIBA', section: 'M-1', gender: 'FEMALE', fatherName: 'MUHAMMAD JAVED ANWAR', phone: '03444977385' },
  { rollNo: '126', name: 'HINA TARIQ', section: 'M-1', gender: 'FEMALE', fatherName: 'TARIQ MEHMOOD', phone: '03401456000' },
  { rollNo: '127', name: 'AROOJ FATIMA', section: 'M-1', gender: 'FEMALE', fatherName: 'GHULAM GHOUS', phone: '03077011441' },
  { rollNo: '128', name: 'ZOHA RASHEED', section: 'M-1', gender: 'FEMALE', fatherName: 'RASHEED', phone: '03007245142' },
  { rollNo: '129', name: 'KHADIJA IRFAN', section: 'M-1', gender: 'FEMALE', fatherName: 'MUHAMMAD IRFAN', phone: '03447017790' },
  { rollNo: '130', name: 'ZAINAB BIBI', section: 'M-1', gender: 'FEMALE', fatherName: 'FAYYAZ AHMAD', phone: '' },
  { rollNo: '131', name: 'LAIBA AKBAR', section: 'M-1', gender: 'FEMALE', fatherName: 'AKBAR ALI', phone: '03039510207' },
  { rollNo: '132', name: 'AROOBA RAFIQUE', section: 'M-1', gender: 'FEMALE', fatherName: 'MUHAMMAD RAFIQUE', phone: '03413617541' },
  { rollNo: '133', name: 'ALEENA NADEEM', section: 'M-1', gender: 'FEMALE', fatherName: 'MUHAMMAD NADEEM', phone: '03457190471' },
  { rollNo: '134', name: 'NOOR UL EMAN', section: 'M-1', gender: 'FEMALE', fatherName: 'MUHAMMAD IRFAN', phone: '03447017790' },
  { rollNo: '135', name: 'BARIRA ASLAM', section: 'M-1', gender: 'FEMALE', fatherName: 'MUHAMMAD ASLAM', phone: '03155669469' },
  { rollNo: '136', name: 'HUSNA', section: 'M-1', gender: 'FEMALE', fatherName: 'FAKHAR ABBAS', phone: '' },
  { rollNo: '137', name: 'HAFSA KHIZAR', section: 'M-1', gender: 'FEMALE', fatherName: 'KHIZER HAYAT', phone: '03414606713' },
  { rollNo: '138', name: 'MINAHIL FATIMA', section: 'M-1', gender: 'FEMALE', fatherName: 'IKHLAQ AHMAD', phone: '03117538143' },
  { rollNo: '139', name: 'EMAAN FATIMA', section: 'M-1', gender: 'FEMALE', fatherName: 'RAIZ AHMAD', phone: '03454180053' },
  { rollNo: '140', name: 'IMAN RAMZAN', section: 'M-1', gender: 'FEMALE', fatherName: 'RAMZAN', phone: '03096376624' },
  { rollNo: '141', name: 'ISHWA YOUSAF', section: 'M-1', gender: 'FEMALE', fatherName: 'MUHAMMAD YOUSAF', phone: '03167100325' },
  { rollNo: '142', name: 'ROMAIZAH', section: 'M-1', gender: 'FEMALE', fatherName: 'MUHAMMAD AMJAD', phone: '03457817452' },
  { rollNo: '143', name: 'AMINA SAJJID', section: 'M-1', gender: 'FEMALE', fatherName: 'MUHAMMAD BOTTA', phone: '' },
  { rollNo: '144', name: 'MEHWISH ALI SHER', section: 'M-1', gender: 'FEMALE', fatherName: 'ALI SHER', phone: '03468721402' },

  // C-2 Section (10 students)
  { rollNo: '251', name: 'FIZA IMRAN', section: 'C-2', gender: 'FEMALE', fatherName: 'M IMRAN', phone: '03057191833' },
  { rollNo: '252', name: 'KAINAT ZAHID', section: 'C-2', gender: 'FEMALE', fatherName: 'HAFIZ KHALID MAHMOOD', phone: '03052304056' },
  { rollNo: '253', name: 'HUMA KHIZAR', section: 'C-2', gender: 'FEMALE', fatherName: 'KHIZAR HAYAT', phone: '03453435249' },
  { rollNo: '254', name: 'MALEEHA LATIF', section: 'C-2', gender: 'FEMALE', fatherName: 'MUHAMMAD LATIF', phone: '03029235062' },
  { rollNo: '255', name: 'YASHAL NOOR', section: 'C-2', gender: 'FEMALE', fatherName: 'FARRUKH NAZIR', phone: '' },
  { rollNo: '256', name: 'SEHAR IQBAL', section: 'C-2', gender: 'FEMALE', fatherName: 'MUHAMMAD IQBAL', phone: '03061286136' },
  { rollNo: '257', name: 'MINAHIL NAWAZ', section: 'C-2', gender: 'FEMALE', fatherName: 'MUHAMMAD NAWAZ', phone: '03057162085' },
  { rollNo: '258', name: 'MAHNOOR RIAZ', section: 'C-2', gender: 'FEMALE', fatherName: 'MUHAMMAD RIAZ', phone: '03057995160' },
  { rollNo: '259', name: 'ZAINAB JAMEEL', section: 'C-2', gender: 'FEMALE', fatherName: 'MUHAMMAD JAMEL', phone: '03017041290' },
  { rollNo: '260', name: 'TUBA TARIQ', section: 'C-2', gender: 'FEMALE', fatherName: 'TARIQ MEHMOOD', phone: '03447891778' },

  // E-1 Section (4 students)
  { rollNo: '501', name: 'AQSA NASIR', section: 'E-1', gender: 'FEMALE', fatherName: 'NASIR ALI', phone: '03428802300' },
  { rollNo: '502', name: 'MEHWISH HAMEED', section: 'E-1', gender: 'FEMALE', fatherName: 'ABDUL HAMEED', phone: '03447622142' },
  { rollNo: '503', name: 'SARA KHALID', section: 'E-1', gender: 'FEMALE', fatherName: 'MUHAMMAD KHALID', phone: '03462167203' },
  { rollNo: '504', name: 'SABA FATIMA', section: 'E-1', gender: 'FEMALE', fatherName: 'MUHAMMAD AFZAL', phone: '03023997688' },

  // I.Com 1 Section (4 students)
  { rollNo: '401', name: 'NOOR FATIMA', section: 'I.Com 1', gender: 'FEMALE', fatherName: 'SULTAN MEHMOOD', phone: '03060668192' },
  { rollNo: '402', name: 'LAIBA ALI', section: 'I.Com 1', gender: 'FEMALE', fatherName: 'ASIF ALI AKASH', phone: '03156943471' },
  { rollNo: '403', name: 'MANAHIL ADIL', section: 'I.Com 1', gender: 'FEMALE', fatherName: 'ADIL MEHMOOD', phone: '03281479134' },
  { rollNo: '404', name: 'RABIA IRFAN', section: 'I.Com 1', gender: 'FEMALE', fatherName: 'M IRFAN', phone: '' },

  // IT-1 Section (3 students)
  { rollNo: '301', name: 'AMINA BIBI', section: 'IT-1', gender: 'FEMALE', fatherName: 'ASIF ALI', phone: '03004069490' },
  { rollNo: '302', name: 'ZAINAB IRFAN', section: 'IT-1', gender: 'FEMALE', fatherName: 'IRFAN ASHRAF', phone: '03402013530' },
  { rollNo: '303', name: 'MEERAB JAVED', section: 'IT-1', gender: 'FEMALE', fatherName: 'JAVED AKHTAR', phone: '03027153334' },
];

async function main() {
  console.log('📚 BULK IMPORTING ALL STUDENTS\n');
  console.log('='.repeat(60));

  try {
    const ay = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
    const classObj = await prisma.class.findFirst({ where: { name: '1st Year' } });

    if (!ay || !classObj) {
      throw new Error('Academic year or class not found');
    }

    // Get all unique sections
    const sections = [...new Set(studentsData.map(s => s.section))];
    console.log(`\n📋 Sections to process: ${sections.join(', ')}`);
    console.log(`👥 Total students to import: ${studentsData.length}\n`);

    // Create sections
    const sectionMap = {};
    for (const sectionName of sections) {
      let section = await prisma.section.findFirst({
        where: { name: sectionName, classId: classObj.id }
      });

      if (!section) {
        section = await prisma.section.create({
          data: { name: sectionName, classId: classObj.id }
        });
        console.log(`✅ Created section: ${sectionName}`);
      } else {
        console.log(`✓ Section exists: ${sectionName}`);
      }
      sectionMap[sectionName] = section;
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔄 Starting import...\n`);

    let imported = 0;
    let skipped = 0;
    let failed = 0;
    const errors = [];

    for (const stu of studentsData) {
      try {
        // Check if already exists
        const existing = await prisma.student.findUnique({
          where: { rollNo_deletedAt: { rollNo: stu.rollNo, deletedAt: null } }
        }).catch(() => null);

        if (existing) {
          skipped++;
          process.stdout.write('⊘');
          continue;
        }

        // Parse name
        const nameParts = stu.name.trim().split(/\s+/);
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || '';

        // Format phone
        let phone = (stu.phone || '').trim();
        if (phone && phone !== '0' && !phone.startsWith('0')) {
          phone = '0' + phone;
        } else if (!phone || phone === '0') {
          phone = null;
        }

        const section = sectionMap[stu.section];

        // Create student
        await prisma.student.create({
          data: {
            rollNo: stu.rollNo,
            firstName,
            lastName,
            gender: stu.gender,
            fatherName: stu.fatherName,
            fatherPhone: phone,
            feeCategory: 'REGULAR',
            classId: classObj.id,
            sectionId: section.id,
            academicYearId: ay.id,
            admissionDate: new Date('2025-04-01'),
            admissionType: 'NEW',
            status: 'ACTIVE',
            isActive: true
          }
        });

        imported++;
        process.stdout.write('.');
      } catch (e) {
        failed++;
        errors.push(`${stu.rollNo}: ${e.message.split('\n')[0]}`);
        process.stdout.write('✗');
      }
    }

    console.log(`\n\n${'='.repeat(60)}`);
    console.log(`✅ IMPORT COMPLETE!`);
    console.log(`${'='.repeat(60)}`);
    console.log(`✓ Imported: ${imported} students`);
    console.log(`⊘ Skipped (already exist): ${skipped} students`);
    console.log(`✗ Failed: ${failed} students`);

    if (errors.length > 0) {
      console.log(`\n⚠️  First 5 errors:`);
      errors.slice(0, 5).forEach(e => console.log(`   - ${e}`));
    }

    console.log(`\n${'='.repeat(60)}\n`);

  } catch (e) {
    console.error('❌ Fatal error:', e.message);
  }

  await prisma.$disconnect();
}

main();
