require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// REMAINING STUDENTS - C-3, C-4, C-5, M-4, E-2, IT-2
const remainingStudents = [
  // M-4 Section (25 students)
  { rollNo: '101M', name: 'RANA FRAZ BILAL', section: 'M-4', gender: 'MALE', fatherName: 'RANA BILAL HUSSAIN', phone: '03016374800' },
  { rollNo: '102M', name: 'MUHAMMAD MUEEZ RAZA', section: 'M-4', gender: 'MALE', fatherName: 'MUHAMMAD RAZA', phone: '03417995148' },
  { rollNo: '103M', name: 'HUSSAIN ASHRAF', section: 'M-4', gender: 'MALE', fatherName: 'MUHAMMAD ASHRAF', phone: '03216082142' },
  { rollNo: '104M', name: 'MUHAMMAD ABUBAKAR SADDIQUE', section: 'M-4', gender: 'MALE', fatherName: 'KHIZAR HAYAT', phone: '03453435249' },
  { rollNo: '105M', name: 'MUHAMMAD FAROOQ', section: 'M-4', gender: 'MALE', fatherName: 'YOUSAF ALI', phone: '03436040439' },
  { rollNo: '106M', name: 'HAMMAD NAWAZ', section: 'M-4', gender: 'MALE', fatherName: 'MUHAMMAD NAWAZ', phone: '03463598430' },
  { rollNo: '107M', name: 'ZAIN ASHIQ', section: 'M-4', gender: 'MALE', fatherName: 'MUHAMMAD ASHIQ', phone: '03438279067' },
  { rollNo: '108M', name: 'ZAYYAN AHMAD', section: 'M-4', gender: 'MALE', fatherName: 'SALEEM NAWAZ', phone: '03357908810' },
  { rollNo: '109M', name: 'ABDULLAH ZAHID', section: 'M-4', gender: 'MALE', fatherName: 'ZAHID AHMAD KHAN', phone: '03023439412' },
  { rollNo: '110M', name: 'M AHSAN', section: 'M-4', gender: 'MALE', fatherName: 'M. IMRAN', phone: '03069850021' },
  { rollNo: '111M', name: 'ABDULLAH FAROOQ', section: 'M-4', gender: 'MALE', fatherName: 'AMJAD FAROOQ', phone: '03095586023' },
  { rollNo: '112M', name: 'ZOHAIB HUSSAIN', section: 'M-4', gender: 'MALE', fatherName: 'MUHAMMAD MOHSIN HUSSAIN', phone: '03026088094' },
  { rollNo: '113M', name: 'MUHAMMAD HASSAN MUSTAFA', section: 'M-4', gender: 'MALE', fatherName: 'GHULAM MUSTAFA ANWAR', phone: '03083703214' },
  { rollNo: '114M', name: 'MUHAMMAD AHSAN', section: 'M-4', gender: 'MALE', fatherName: 'HABIBULLAH', phone: '03328059203' },
  { rollNo: '115M', name: 'AHMAD RAZA', section: 'M-4', gender: 'MALE', fatherName: 'MUHAMMAD SARDAR', phone: '03700428540' },
  { rollNo: '116M', name: 'SAAD MEHMOOD', section: 'M-4', gender: 'MALE', fatherName: 'GHULAM MEHMOOD', phone: '' },
  { rollNo: '117M', name: 'MUJEEB TARIQ', section: 'M-4', gender: 'MALE', fatherName: 'TARIQ MEHMOOD', phone: '03484966217' },
  { rollNo: '118M', name: 'HAFIZ MUHAMMAD SOHAIB', section: 'M-4', gender: 'MALE', fatherName: 'KHALIL UR REHMAN', phone: '03004524028' },
  { rollNo: '119M', name: 'MUHAMMAD HAMMAD', section: 'M-4', gender: 'MALE', fatherName: 'MUHAMMAD IFTIKHAR', phone: '03326492015' },
  { rollNo: '120M', name: 'M AHSAN SALEEM', section: 'M-4', gender: 'MALE', fatherName: 'M SALEEM', phone: '03442580031' },
  { rollNo: '121M', name: 'MUHAMMAD ABUBAKAR', section: 'M-4', gender: 'MALE', fatherName: 'MUHAMMAD IBRAR KHAN', phone: '03067429164' },
  { rollNo: '122M', name: 'TABASSUM RASOOL', section: 'M-4', gender: 'MALE', fatherName: 'MUHAMMAD ISMAIL', phone: '03039510207' },
  { rollNo: '123M', name: 'MUHAMMAD ATHER NASEEB', section: 'M-4', gender: 'MALE', fatherName: 'MUHAMMAD TARIQ', phone: '03017072213' },
  { rollNo: '124M', name: 'SYED RYEET ABBAS', section: 'M-4', gender: 'MALE', fatherName: 'SYED KHAWER ABBAS', phone: '03009807586' },
  { rollNo: '125M', name: 'MUHAMMAD UMER', section: 'M-4', gender: 'MALE', fatherName: 'ABDUL ALEEM', phone: '03064844452' },

  // E-2 Section (20 students)
  { rollNo: '501E', name: 'MUHAMMAD HAMMAD', section: 'E-2', gender: 'MALE', fatherName: 'MUHAMMAD MANSHA', phone: '03026344476' },
  { rollNo: '502E', name: 'NAVEED ANJUM', section: 'E-2', gender: 'MALE', fatherName: 'MUHAMMAD SHAKEEL AHMAD', phone: '03066744531' },
  { rollNo: '503E', name: 'MUHAMMAD SUFYAN', section: 'E-2', gender: 'MALE', fatherName: 'MUHAMMAD RAFIQUE', phone: '03260064442' },
  { rollNo: '504E', name: 'MUHAMMAD SAMI', section: 'E-2', gender: 'MALE', fatherName: 'MUKHTAR ALI', phone: '03104401283' },
  { rollNo: '505E', name: 'MUHAMMAD HAMMAD NAZIR', section: 'E-2', gender: 'MALE', fatherName: 'SHOUKAT ALI', phone: '03154850484' },
  { rollNo: '506E', name: 'MUHAMMAD FAIZAN ANWAR', section: 'E-2', gender: 'MALE', fatherName: 'MUHAMMAD ANWAR', phone: '03446164463' },
  { rollNo: '507E', name: 'ZAID', section: 'E-2', gender: 'MALE', fatherName: 'MUBASHIR IQBAL', phone: '03271274533' },
  { rollNo: '508E', name: 'FAIZAN', section: 'E-2', gender: 'MALE', fatherName: 'MUHAMMAD HUSSAIN', phone: '03024711632' },
  { rollNo: '509E', name: 'IHSANULLAH', section: 'E-2', gender: 'MALE', fatherName: 'SAIFULLAH', phone: '03057456506' },
  { rollNo: '510E', name: 'AKASHA FAROOQ', section: 'E-2', gender: 'MALE', fatherName: 'SANAULLAH', phone: '03046788911' },
  { rollNo: '511E', name: 'WASIF ALI', section: 'E-2', gender: 'MALE', fatherName: 'MUHAMMAD ALI', phone: '03467463530' },
  { rollNo: '512E', name: 'UMAR SADDIQUE', section: 'E-2', gender: 'MALE', fatherName: 'MUHAMMAD SADDIQUE', phone: '03492278139' },
  { rollNo: '513E', name: 'ARSLAN BASHIR', section: 'E-2', gender: 'MALE', fatherName: 'MUHAMMAD BASHIR', phone: '03421752573' },
  { rollNo: '514E', name: 'FARRUKH IJAZ', section: 'E-2', gender: 'MALE', fatherName: 'IJAZ AHMAD', phone: '03057275466' },
  { rollNo: '515E', name: 'ALI SHAN', section: 'E-2', gender: 'MALE', fatherName: 'GHULAM HUSSAIN', phone: '03367790142' },
  { rollNo: '516E', name: 'ZOHAIB ANWAR', section: 'E-2', gender: 'MALE', fatherName: 'RIAZ AHMAD KHAN', phone: '03057565726' },
  { rollNo: '517E', name: 'MUHAMMAD SHERAZ', section: 'E-2', gender: 'MALE', fatherName: 'ANEES AHMAD', phone: '03036379198' },
  { rollNo: '518E', name: 'GHULAM HAIDER', section: 'E-2', gender: 'MALE', fatherName: 'MUHAMMAD RASHEED', phone: '03427734397' },
  { rollNo: '519E', name: 'DAWOOD IMRAN', section: 'E-2', gender: 'MALE', fatherName: 'IMRAN', phone: '03250088452' },

  // C-3 Section (40 students)
  { rollNo: '201C3', name: 'AHTISHAM ALI', section: 'C-3', gender: 'MALE', fatherName: 'MUHAMMAD ARIF', phone: '03167352744' },
  { rollNo: '202C3', name: 'ZAID BILAL', section: 'C-3', gender: 'MALE', fatherName: 'SHAHID BILAL', phone: '03075024461' },
  { rollNo: '203C3', name: 'SAMEER SHAHID', section: 'C-3', gender: 'MALE', fatherName: 'SHAHID ALI', phone: '03081481541' },
  { rollNo: '204C3', name: 'MUHAMMAD KASHAN', section: 'C-3', gender: 'MALE', fatherName: 'ASIF MEHMOOD', phone: '03004746664' },
  { rollNo: '205C3', name: 'ZAIN UL ABIDEEN', section: 'C-3', gender: 'MALE', fatherName: 'M IFTIKHAR', phone: '03006457620' },
  { rollNo: '206C3', name: 'MUHAMMAD ZAID', section: 'C-3', gender: 'MALE', fatherName: 'MUHAMMAD AKRAM', phone: '03014252187' },
  { rollNo: '207C3', name: 'MUAHMMAD HASSAN SHAHZAD', section: 'C-3', gender: 'MALE', fatherName: 'ZAHID ALI', phone: '03327575607' },
  { rollNo: '208C3', name: 'AMMAR WAHEED', section: 'C-3', gender: 'MALE', fatherName: 'ABDUL WAHEED', phone: '03090335833' },
  { rollNo: '209C3', name: 'ARHAM SAEED', section: 'C-3', gender: 'MALE', fatherName: 'SAEED NAZIR', phone: '03041516485' },
  { rollNo: '210C3', name: 'UZAIR AHMAD', section: 'C-3', gender: 'MALE', fatherName: 'WAQAR AHMAD', phone: '03060965974' },
  { rollNo: '211C3', name: 'M UMER JAVAID', section: 'C-3', gender: 'MALE', fatherName: 'M JAVAID', phone: '03163451274' },
  { rollNo: '212C3', name: 'MUHAMMAD SUDAIS', section: 'C-3', gender: 'MALE', fatherName: 'ABDUL QAYYUM', phone: '03482767424' },
  { rollNo: '213C3', name: 'MUHAMMAD AHMAD', section: 'C-3', gender: 'MALE', fatherName: 'MUHAMMAD IMRAN', phone: '03461920910' },
  { rollNo: '214C3', name: 'MUHAMMAD NABRAS', section: 'C-3', gender: 'MALE', fatherName: 'RASHID MASOOD', phone: '03443562940' },
  { rollNo: '215C3', name: 'AHMAD RAZA', section: 'C-3', gender: 'MALE', fatherName: 'MUHAMMAD SHAKEEL AHMAD', phone: '03066744531' },
  { rollNo: '216C3', name: 'HANZALA', section: 'C-3', gender: 'MALE', fatherName: 'M SARWAR', phone: '03291850481' },
  { rollNo: '217C3', name: 'AHTISHAM UL HAQ', section: 'C-3', gender: 'MALE', fatherName: 'INAM UL HAQ', phone: '03450530452' },
  { rollNo: '218C3', name: 'MOHSIN ABBAS', section: 'C-3', gender: 'MALE', fatherName: 'MUHAMMAD GUFRAN', phone: '03057200709' },
  { rollNo: '219C3', name: 'MUHAMMAD IMRAN', section: 'C-3', gender: 'MALE', fatherName: 'MUHAMMAD YAMEEN KHAN', phone: '03194890565' },
  { rollNo: '220C3', name: 'TAYYAB', section: 'C-3', gender: 'MALE', fatherName: 'IMDADULLAH', phone: '03327144137' },
];

async function main() {
  console.log('📚 IMPORTING REMAINING STUDENTS\n');
  console.log('='.repeat(60));

  try {
    const ay = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
    const classObj = await prisma.class.findFirst({ where: { name: '1st Year' } });

    if (!ay || !classObj) {
      throw new Error('Academic year or class not found');
    }

    // Get unique sections
    const sections = [...new Set(remainingStudents.map(s => s.section))];
    console.log(`\n📋 Sections to process: ${sections.join(', ')}`);
    console.log(`👥 Total students to import: ${remainingStudents.length}\n`);

    // Create sections if needed
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
    let failed = 0;

    for (const stu of remainingStudents) {
      try {
        const nameParts = stu.name.trim().split(/\s+/);
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || '';

        let phone = (stu.phone || '').trim();
        if (phone && phone !== '0' && !phone.startsWith('0')) {
          phone = '0' + phone;
        } else if (!phone || phone === '0') {
          phone = null;
        }

        const section = sectionMap[stu.section];

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
        process.stdout.write('✗');
      }
    }

    console.log(`\n\n${'='.repeat(60)}`);
    console.log(`✅ IMPORT COMPLETE!`);
    console.log(`${'='.repeat(60)}`);
    console.log(`✓ Imported: ${imported} students`);
    console.log(`✗ Failed: ${failed} students`);
    console.log(`${'='.repeat(60)}\n`);

  } catch (e) {
    console.error('❌ Fatal error:', e.message);
  }

  await prisma.$disconnect();
}

main();
