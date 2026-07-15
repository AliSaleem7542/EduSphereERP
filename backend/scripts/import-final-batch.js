require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// FINAL BATCH - C-4, C-5, IT-2
const finalStudents = [
  // C-4 Section (34 students)
  { rollNo: '244', name: 'SARDAR TALAL', section: 'C-4', gender: 'MALE', fatherName: 'MUHAMMAD FAROOQ', phone: '03457996484' },
  { rollNo: '245', name: 'HAFIZ MUHAMMAD UMAR', section: 'C-4', gender: 'MALE', fatherName: 'MUHAMMAD RIAZ', phone: '03076027826' },
  { rollNo: '246', name: 'FAIZAN SABIR', section: 'C-4', gender: 'MALE', fatherName: 'ASHFAQ SABIR', phone: '03099379500' },
  { rollNo: '247', name: 'ZAIN ABDULLAH', section: 'C-4', gender: 'MALE', fatherName: 'SHOUKAT HAYYAT', phone: '03020652808' },
  { rollNo: '248', name: 'MUHAMMAD WASEEM', section: 'C-4', gender: 'MALE', fatherName: 'NASIR ALI', phone: '03460459456' },
  { rollNo: '249', name: 'ABDUL WAHAB', section: 'C-4', gender: 'MALE', fatherName: 'MUHAMMAD ISHTIAQ', phone: '03062537723' },
  { rollNo: '250', name: 'ABDULLAH PASWAL', section: 'C-4', gender: 'MALE', fatherName: 'NAEEM PASWAL', phone: '03336692142' },
  { rollNo: '251', name: 'MUEEZULLAH', section: 'C-4', gender: 'MALE', fatherName: 'MUHAMMAD ABBAS', phone: '03012751386' },
  { rollNo: '252', name: 'TALHA HAMDAN', section: 'C-4', gender: 'MALE', fatherName: 'MUHAMMAD AKBAR', phone: '03276247302' },
  { rollNo: '253', name: 'ALI HAMZA', section: 'C-4', gender: 'MALE', fatherName: 'ASHRAF ALI', phone: '03008045852' },
  { rollNo: '254', name: 'ABDULLAH ARSHAD', section: 'C-4', gender: 'MALE', fatherName: 'MUHAMMAD ARSHAD', phone: '03437196340' },
  { rollNo: '255', name: 'HUZAIFA AFZAL', section: 'C-4', gender: 'MALE', fatherName: 'MUHAMMAD AFZAL', phone: '03015448974' },
  { rollNo: '256', name: 'MUHAMMAD AHMAD', section: 'C-4', gender: 'MALE', fatherName: 'AHMAD', phone: '03019238650' },
  { rollNo: '257', name: 'MUHAMMAD MOSAB', section: 'C-4', gender: 'MALE', fatherName: 'MUHAMMAD ABBAS', phone: '03016044278' },
  { rollNo: '258', name: 'ABDUL REHMAN', section: 'C-4', gender: 'MALE', fatherName: 'WAHEED AKHTAR', phone: '03029175916' },
  { rollNo: '259', name: 'MOHSIN ALI', section: 'C-4', gender: 'MALE', fatherName: 'ASHIQ ALI', phone: '03291710533' },
  { rollNo: '260', name: 'M MUNEEB TARIQ', section: 'C-4', gender: 'MALE', fatherName: 'TARIQ MEHMOOD', phone: '03036830144' },
  { rollNo: '261', name: 'AHMAD KASHIF', section: 'C-4', gender: 'MALE', fatherName: 'KASHIF JAVED', phone: '03260590746' },
  { rollNo: '262', name: 'ALI AHMED TARIQ', section: 'C-4', gender: 'MALE', fatherName: 'TARIQ MEHMOOD', phone: '03401456000' },
  { rollNo: '263', name: 'SARDAR MUHAMMAD SAAD', section: 'C-4', gender: 'MALE', fatherName: 'ISRAR AHMAD', phone: '03007277137' },
  { rollNo: '264', name: 'ALI HAIDER', section: 'C-4', gender: 'MALE', fatherName: 'ABRAR HUSSAIN', phone: '03061386141' },
  { rollNo: '265', name: 'ALI HASSAN', section: 'C-4', gender: 'MALE', fatherName: 'RIAZ AHMAD', phone: '03215793373' },
  { rollNo: '266', name: 'ABDUL WAHID', section: 'C-4', gender: 'MALE', fatherName: 'ABDUL SHAKOOR', phone: '03277690698' },
  { rollNo: '267', name: 'ABU BAKAR ILYAS', section: 'C-4', gender: 'MALE', fatherName: 'MUHAMMAD ILYAS', phone: '03427817465' },
  { rollNo: '268', name: 'HAMZA SAHAFIQUE', section: 'C-4', gender: 'MALE', fatherName: 'SHAFIQUE AHMAD', phone: '03261130452' },
  { rollNo: '269', name: 'ALI HAIDER', section: 'C-4', gender: 'MALE', fatherName: 'MUHAMMAD IDRESS', phone: '03015056701' },
  { rollNo: '270', name: 'GUL ZAMAN KHAN', section: 'C-4', gender: 'MALE', fatherName: 'ABDUL HAMEED KHAN', phone: '03215348136' },
  { rollNo: '271', name: 'MUHAMMAD REHMAN', section: 'C-4', gender: 'MALE', fatherName: 'LIAQAT ALI', phone: '03421822441' },
  { rollNo: '272', name: 'SAIM SHAFIQ', section: 'C-4', gender: 'MALE', fatherName: 'SHAFIQ UR REHMAN', phone: '03201319509' },
  { rollNo: '273', name: 'MUHAMMAD RAFAY', section: 'C-4', gender: 'MALE', fatherName: 'TOUQEER AHMAD', phone: '03219944292' },
  { rollNo: '274', name: 'M. HAMMAD', section: 'C-4', gender: 'MALE', fatherName: 'GULZAR AHMAD', phone: '03291371142' },
  { rollNo: '275', name: 'MUHAMMAD ZEESHAN', section: 'C-4', gender: 'MALE', fatherName: 'MUHAMMAD IRFAN', phone: '03007615807' },
  { rollNo: '276', name: 'HASSAN JAVED', section: 'C-4', gender: 'MALE', fatherName: 'MUHAMMAD JAVED', phone: '03227763136' },
  { rollNo: '277', name: 'MUHAMMAD RAMEEZ KHAN', section: 'C-4', gender: 'MALE', fatherName: 'MUHAMMAD SHAKEEL KHAN', phone: '03048155963' },

  // C-5 Section (19 students)
  { rollNo: '401C5', name: 'ZEESHAN ALI', section: 'C-5', gender: 'MALE', fatherName: 'MUSHTAQ ALI', phone: '03426182146' },
  { rollNo: '402C5', name: 'SAMAR ABBAS', section: 'C-5', gender: 'MALE', fatherName: 'ABDUL KHALIQ', phone: '03281995774' },
  { rollNo: '403C5', name: 'MUHAMMAD HAMZA YOUNIS', section: 'C-5', gender: 'MALE', fatherName: 'MUHAMMAD YOUNIS', phone: '03007982117' },
  { rollNo: '404C5', name: 'HAFIZ UMAIS NISAR', section: 'C-5', gender: 'MALE', fatherName: 'HAFIZ NISAR AHMAD', phone: '03007982117' },
  { rollNo: '405C5', name: 'ABDUL WAHAB', section: 'C-5', gender: 'MALE', fatherName: 'ABDUL RAZZAQ', phone: '03053370963' },
  { rollNo: '406C5', name: 'MUHAMMAD IKRAM', section: 'C-5', gender: 'MALE', fatherName: 'IMRAN KHAN', phone: '03212890467' },
  { rollNo: '407C5', name: 'HAMZA ISHFAQ', section: 'C-5', gender: 'MALE', fatherName: 'MUHAMMAD ISHFAQ', phone: '03075874868' },
  { rollNo: '408C5', name: 'AHMAD RAZA', section: 'C-5', gender: 'MALE', fatherName: 'GULZAR AHMAD', phone: '03187419645' },
  { rollNo: '409C5', name: 'UMAIR LIAQAT', section: 'C-5', gender: 'MALE', fatherName: 'LIAQAT ALI', phone: '03322160300' },
  { rollNo: '410C5', name: 'MUHAMMAD HARIS', section: 'C-5', gender: 'MALE', fatherName: 'MUHAMMAD ASHRAF', phone: '03004240464' },
  { rollNo: '411C5', name: 'MUHAMMAD SAAD JAVAID', section: 'C-5', gender: 'MALE', fatherName: 'JAVAID IQBAL', phone: '' },
  { rollNo: '412C5', name: 'M FIAZ ABDULLAH', section: 'C-5', gender: 'MALE', fatherName: 'MIAN MUHAMMAD RIAZ', phone: '' },
  { rollNo: '413C5', name: 'MUHAMMAD FAHAD', section: 'C-5', gender: 'MALE', fatherName: 'MUHAMMAD ADREES', phone: '03057265670' },
  { rollNo: '414C5', name: 'ABDULLAH NAWAZ', section: 'C-5', gender: 'MALE', fatherName: 'MUHAMMAD NAWAZ', phone: '03414599453' },
  { rollNo: '415C5', name: 'MUHAMMAD HUSSNAIN', section: 'C-5', gender: 'MALE', fatherName: 'SALAHUDIN', phone: '03000570262' },
  { rollNo: '416C5', name: 'ASAD ALI', section: 'C-5', gender: 'MALE', fatherName: 'MUHAMMAD AKRAM', phone: '' },
  { rollNo: '417C5', name: 'MUHAMMAD MUSTAFA', section: 'C-5', gender: 'MALE', fatherName: 'MUHAMMAD ZAULFIQAR', phone: '' },
  { rollNo: '418C5', name: 'MUHAMMAD WASIF', section: 'C-5', gender: 'MALE', fatherName: 'SARDAR', phone: '' },
  { rollNo: '419C5', name: 'MUHAMMAD HASSAM', section: 'C-5', gender: 'MALE', fatherName: 'ZULFIQAR ALI', phone: '03484115091' },

  // IT-2 Section (14 students)
  { rollNo: '301IT', name: 'MUHAMMAD ALEEM SAJID', section: 'IT-2', gender: 'MALE', fatherName: 'MUHAMMD SAJID', phone: '03223802341' },
  { rollNo: '302IT', name: 'M. SOHAIB', section: 'IT-2', gender: 'MALE', fatherName: 'ABDUL SATTAR', phone: '03045060935' },
  { rollNo: '303IT', name: 'USMAN FAROOQ', section: 'IT-2', gender: 'MALE', fatherName: 'MUHAMMAD FAROOQ', phone: '03013953100' },
  { rollNo: '304IT', name: 'TAHA HUSSAIN', section: 'IT-2', gender: 'MALE', fatherName: 'GHULAM MUSTAFA', phone: '03261806533' },
  { rollNo: '305IT', name: 'ABDUL REHMAN', section: 'IT-2', gender: 'MALE', fatherName: 'MUHAMMAD RAMZAN', phone: '03261546919' },
  { rollNo: '306IT', name: 'ALI MURTAZA', section: 'IT-2', gender: 'MALE', fatherName: 'M ASLAM', phone: '03013207088' },
  { rollNo: '307IT', name: 'UZAIR ANWAR', section: 'IT-2', gender: 'MALE', fatherName: 'MUHAMMAD ANWAR', phone: '03414012689' },
  { rollNo: '308IT', name: 'ZULFIQAR', section: 'IT-2', gender: 'MALE', fatherName: 'SALAMAT ALI', phone: '' },
  { rollNo: '309IT', name: 'SHAHID REHMAN', section: 'IT-2', gender: 'MALE', fatherName: 'ABDUL REHMAN', phone: '03077565325' },
  { rollNo: '310IT', name: 'HAMZA ISLAM', section: 'IT-2', gender: 'MALE', fatherName: 'ABDUL ISLAM', phone: '03428460479' },
  { rollNo: '311IT', name: 'SAMIULLAH', section: 'IT-2', gender: 'MALE', fatherName: 'MUHAMMAD NASARULLAH', phone: '03027950461' },
  { rollNo: '312IT', name: 'MUHAMMAD SUBHAN', section: 'IT-2', gender: 'MALE', fatherName: 'SARFRAZ AHMAD', phone: '' },
  { rollNo: '313IT', name: 'DAWOOD MASIH', section: 'IT-2', gender: 'MALE', fatherName: 'SALEEM MASIH', phone: '03408759003' },
  { rollNo: '314IT', name: 'MUHAMMAD AOUN', section: 'IT-2', gender: 'MALE', fatherName: 'AURANGZAIB', phone: '' },
];

async function main() {
  console.log('📚 IMPORTING FINAL BATCH OF STUDENTS\n');
  console.log('='.repeat(60));

  try {
    const ay = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
    const classObj = await prisma.class.findFirst({ where: { name: '1st Year' } });

    if (!ay || !classObj) {
      throw new Error('Academic year or class not found');
    }

    const sections = [...new Set(finalStudents.map(s => s.section))];
    console.log(`\n📋 Sections to process: ${sections.join(', ')}`);
    console.log(`👥 Total students to import: ${finalStudents.length}\n`);

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

    for (const stu of finalStudents) {
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
    console.log(`✅ ALL STUDENTS IMPORTED!`);
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
