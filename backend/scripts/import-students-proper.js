require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Student data from your CSV
const studentsData = [
  { rollNo: '201', name: 'AMAN KHAN', class: '1st Year', section: 'C-1', gender: 'MALE', fatherName: 'RANA TASLEEM', phone: '033366997' },
  { rollNo: '202', name: 'NIMRA BASHIR', class: '1st Year', section: 'C-1', gender: 'FEMALE', fatherName: 'BASHIR AHMAD ZAHID', phone: '03408653449' },
  { rollNo: '203', name: 'MUNTAHA NOOR', class: '1st Year', section: 'C-1', gender: 'FEMALE', fatherName: 'MUHAMMAD RIZWAN', phone: '03187018942' },
  { rollNo: '204', name: 'ROMAAN AFZAAL', class: '1st Year', section: 'C-1', gender: 'MALE', fatherName: 'MUHAMMAD AFZAAL', phone: '03036227655' },
  { rollNo: '205', name: 'MARYAM NAZIR', class: '1st Year', section: 'C-1', gender: 'FEMALE', fatherName: 'NAZIR AHMAD', phone: '03007667564' },
  { rollNo: '206', name: 'ANAMTA HAYAT', class: '1st Year', section: 'C-1', gender: 'FEMALE', fatherName: 'MUHAMMAD HAYAT KHAN', phone: '03134690929' },
  { rollNo: '207', name: 'UME RUMAN', class: '1st Year', section: 'C-1', gender: 'FEMALE', fatherName: 'SHAHID ALI', phone: '' },
  { rollNo: '208', name: 'MARIUM IDREES', class: '1st Year', section: 'C-1', gender: 'FEMALE', fatherName: 'IDREES AHMED', phone: '' },
  { rollNo: '209', name: 'FATIMA ASHRAF', class: '1st Year', section: 'C-1', gender: 'FEMALE', fatherName: 'MUHAMMAD ASHRAF', phone: '03026004748' },
  { rollNo: '210', name: 'AREEBA SHAHID', class: '1st Year', section: 'C-1', gender: 'FEMALE', fatherName: 'SHAHID ALI', phone: '03167571109' },
];

async function main() {
  console.log('🌱 Importing students...');

  try {
    // Get current academic year
    let academicYear = await prisma.academicYear.findFirst({
      where: { isCurrent: true }
    });

    if (!academicYear) {
      academicYear = await prisma.academicYear.create({
        data: {
          label: '2025-26',
          startDate: new Date('2025-04-01'),
          endDate: new Date('2026-03-31'),
          isCurrent: true
        }
      });
      console.log('✅ Created academic year: 2025-26');
    }

    // Get or create classes
    const class1st = await prisma.class.upsert({
      where: { name_academicYearId: { name: '1st Year', academicYearId: academicYear.id } },
      update: {},
      create: {
        name: '1st Year',
        academicYearId: academicYear.id
      }
    });
    console.log('✅ Class 1st Year ready');

    const class2nd = await prisma.class.upsert({
      where: { name_academicYearId: { name: '2nd Year', academicYearId: academicYear.id } },
      update: {},
      create: {
        name: '2nd Year',
        academicYearId: academicYear.id
      }
    });
    console.log('✅ Class 2nd Year ready');

    // Get or create sections for 1st year
    const sections = ['C-1', 'C-2', 'C-3', 'C-4', 'C-5', 'M-1', 'M-4', 'E-1', 'E-2', 'I.Com 1', 'IT-1', 'IT-2'];
    const sectionMap = {};

    for (const sectionName of sections) {
      const section = await prisma.section.upsert({
        where: { name_classId: { name: sectionName, classId: class1st.id } },
        update: {},
        create: {
          name: sectionName,
          classId: class1st.id
        }
      });
      sectionMap[sectionName] = section;
    }
    console.log(`✅ Created ${sections.length} sections`);

    // Import students
    let imported = 0;
    let failed = 0;

    for (const stu of studentsData) {
      try {
        // Parse name
        const nameParts = stu.name.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');

        // Add 0 prefix to phone if needed
        let phone = stu.phone || '';
        if (phone && !phone.startsWith('0')) {
          phone = '0' + phone;
        }

        // Get section
        const section = sectionMap[stu.section];

        // Create student
        const student = await prisma.student.create({
          data: {
            rollNo: stu.rollNo,
            firstName: firstName,
            lastName: lastName,
            gender: stu.gender,
            fatherName: stu.fatherName,
            fatherPhone: phone,
            feeCategory: 'REGULAR',
            classId: class1st.id,
            sectionId: section.id,
            academicYearId: academicYear.id,
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
        console.error(`\n❌ Failed ${stu.rollNo}:`, e.message);
      }
    }

    console.log(`\n\n✅ Import Complete!`);
    console.log(`   ✓ Imported: ${imported}`);
    console.log(`   ✗ Failed: ${failed}\n`);

  } catch (e) {
    console.error('❌ Error:', e);
  }

  await prisma.$disconnect();
}

main();
