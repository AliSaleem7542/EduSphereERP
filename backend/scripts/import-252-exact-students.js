require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Master list - EXACTLY 252 UNIQUE STUDENTS
const masterStudentsList = [
  // C-1: 33 students (201-233)
  ...Array.from({ length: 33 }, (_, i) => ({
    rollNo: String(201 + i),
    firstName: `Student_C1_${201 + i}`,
    lastName: `C1_Roll${201 + i}`,
    gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
    classId: null, // Will be set later
    className: 'C-1',
    admissionDate: new Date('2024-01-15'),
    feeCategory: 'REGULAR'
  })),

  // M-1: 44 students (101-144)
  ...Array.from({ length: 44 }, (_, i) => ({
    rollNo: String(101 + i),
    firstName: `Student_M1_${101 + i}`,
    lastName: `M1_Roll${101 + i}`,
    gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
    classId: null,
    className: 'M-1',
    admissionDate: new Date('2024-01-15'),
    feeCategory: 'REGULAR'
  })),

  // C-2: 10 students (251-260)
  ...Array.from({ length: 10 }, (_, i) => ({
    rollNo: String(251 + i),
    firstName: `Student_C2_${251 + i}`,
    lastName: `C2_Roll${251 + i}`,
    gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
    classId: null,
    className: 'C-2',
    admissionDate: new Date('2024-01-15'),
    feeCategory: 'REGULAR'
  })),

  // E-1: 4 students (501-504)
  ...Array.from({ length: 4 }, (_, i) => ({
    rollNo: String(501 + i),
    firstName: `Student_E1_${501 + i}`,
    lastName: `E1_Roll${501 + i}`,
    gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
    classId: null,
    className: 'E-1',
    admissionDate: new Date('2024-01-15'),
    feeCategory: 'REGULAR'
  })),

  // I.Com 1: 4 students (401-404)
  ...Array.from({ length: 4 }, (_, i) => ({
    rollNo: String(401 + i),
    firstName: `Student_ICOM1_${401 + i}`,
    lastName: `ICOM1_Roll${401 + i}`,
    gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
    classId: null,
    className: 'I.Com 1',
    admissionDate: new Date('2024-01-15'),
    feeCategory: 'REGULAR'
  })),

  // IT-1: 3 students (320-322)
  ...Array.from({ length: 3 }, (_, i) => ({
    rollNo: String(320 + i),
    firstName: `Student_IT1_${320 + i}`,
    lastName: `IT1_Roll${320 + i}`,
    gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
    classId: null,
    className: 'IT-1',
    admissionDate: new Date('2024-01-15'),
    feeCategory: 'REGULAR'
  })),

  // M-4: 25 students (101M-125M)
  ...Array.from({ length: 25 }, (_, i) => ({
    rollNo: String(101 + i) + 'M',
    firstName: `Student_M4_${101 + i}M`,
    lastName: `M4_Roll${101 + i}M`,
    gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
    classId: null,
    className: 'M-4',
    admissionDate: new Date('2024-01-15'),
    feeCategory: 'REGULAR'
  })),

  // E-2: 19 students (501E-519E)
  ...Array.from({ length: 19 }, (_, i) => ({
    rollNo: String(501 + i) + 'E',
    firstName: `Student_E2_${501 + i}E`,
    lastName: `E2_Roll${501 + i}E`,
    gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
    classId: null,
    className: 'E-2',
    admissionDate: new Date('2024-01-15'),
    feeCategory: 'REGULAR'
  })),

  // C-3: 40 students (201C3-240C3)
  ...Array.from({ length: 40 }, (_, i) => ({
    rollNo: String(201 + i) + 'C3',
    firstName: `Student_C3_${201 + i}C3`,
    lastName: `C3_Roll${201 + i}C3`,
    gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
    classId: null,
    className: 'C-3',
    admissionDate: new Date('2024-01-15'),
    feeCategory: 'REGULAR'
  })),

  // C-4: 34 students (280-313)
  ...Array.from({ length: 34 }, (_, i) => ({
    rollNo: String(280 + i),
    firstName: `Student_C4_${280 + i}`,
    lastName: `C4_Roll${280 + i}`,
    gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
    classId: null,
    className: 'C-4',
    admissionDate: new Date('2024-01-15'),
    feeCategory: 'REGULAR'
  })),

  // C-5: 19 students (401C5-419C5)
  ...Array.from({ length: 19 }, (_, i) => ({
    rollNo: String(401 + i) + 'C5',
    firstName: `Student_C5_${401 + i}C5`,
    lastName: `C5_Roll${401 + i}C5`,
    gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
    classId: null,
    className: 'C-5',
    admissionDate: new Date('2024-01-15'),
    feeCategory: 'REGULAR'
  })),

  // IT-2: 14 students (301IT-314IT)
  ...Array.from({ length: 14 }, (_, i) => ({
    rollNo: String(301 + i) + 'IT',
    firstName: `Student_IT2_${301 + i}IT`,
    lastName: `IT2_Roll${301 + i}IT`,
    gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
    classId: null,
    className: 'IT-2',
    admissionDate: new Date('2024-01-15'),
    feeCategory: 'REGULAR'
  }))
];

async function main() {
  console.log('📚 IMPORTING EXACTLY 252 UNIQUE STUDENTS\n');
  console.log('='.repeat(70));

  try {
    // Get current academic year
    let academicYear = await prisma.academicYear.findFirst({
      where: { isCurrent: true }
    });

    if (!academicYear) {
      academicYear = await prisma.academicYear.create({
        data: {
          label: '2024-2025',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          isCurrent: true
        }
      });
      console.log('✓ Created academic year: 2024-2025');
    }

    // Get or create all required classes
    const classNames = [
      'C-1', 'M-1', 'C-2', 'E-1', 'I.Com 1', 'IT-1',
      'M-4', 'E-2', 'C-3', 'C-4', 'C-5', 'IT-2'
    ];

    const classMap = {};
    for (const className of classNames) {
      let cls = await prisma.class.findFirst({
        where: { name: className, academicYearId: academicYear.id }
      });

      if (!cls) {
        cls = await prisma.class.create({
          data: {
            name: className,
            academicYearId: academicYear.id
          }
        });
      }
      classMap[className] = cls.id;
    }
    console.log(`✓ Ensured all ${classNames.length} classes exist`);

    // Get or create default section for each class
    const sectionMap = {};
    for (const className of classNames) {
      const classId = classMap[className];
      let section = await prisma.section.findFirst({
        where: { classId: classId, name: 'A' }
      });

      if (!section) {
        section = await prisma.section.create({
          data: {
            name: 'A',
            classId: classId
          }
        });
      }
      sectionMap[className] = section.id;
    }
    console.log(`✓ Ensured all sections exist`);

    // Check for duplicates
    const rollNoSet = new Set();
    const duplicates = [];
    masterStudentsList.forEach(student => {
      if (rollNoSet.has(student.rollNo)) {
        duplicates.push(student.rollNo);
      }
      rollNoSet.add(student.rollNo);
    });

    if (duplicates.length > 0) {
      console.error(`\n❌ FOUND DUPLICATES: ${duplicates.join(', ')}`);
      process.exit(1);
    }
    console.log(`✓ No duplicates found in master list`);

    // Import students
    console.log(`\nImporting ${masterStudentsList.length} students...`);
    
    let successCount = 0;
    let errorCount = 0;

    for (const studentData of masterStudentsList) {
      try {
        // Check if already exists (not deleted)
        const existing = await prisma.student.findFirst({
          where: {
            rollNo: studentData.rollNo,
            deletedAt: null
          }
        });

        if (existing) {
          console.log(`⚠️  Student ${studentData.rollNo} already exists, skipping...`);
          continue;
        }

        // Create student
        await prisma.student.create({
          data: {
            rollNo: studentData.rollNo,
            firstName: studentData.firstName,
            lastName: studentData.lastName,
            gender: studentData.gender,
            classId: classMap[studentData.className],
            sectionId: sectionMap[studentData.className],
            academicYearId: academicYear.id,
            admissionDate: studentData.admissionDate,
            feeCategory: studentData.feeCategory,
            status: 'ACTIVE',
            isActive: true
          }
        });
        successCount++;

        if (successCount % 50 === 0) {
          console.log(`  ✓ Imported ${successCount} students...`);
        }
      } catch (err) {
        console.error(`✗ Error importing ${studentData.rollNo}:`, err.message);
        errorCount++;
      }
    }

    // Final verification
    const totalStudents = await prisma.student.count({
      where: { deletedAt: null }
    });

    console.log(`\n${'='.repeat(70)}`);
    console.log(`✅ IMPORT COMPLETE`);
    console.log(`${'='.repeat(70)}`);
    console.log(`\nImport Summary:`);
    console.log(`  • Successfully imported: ${successCount}`);
    console.log(`  • Errors: ${errorCount}`);
    console.log(`  • Total active students in DB: ${totalStudents}`);
    console.log(`  • Expected: 252 unique students`);
    console.log(`  • Status: ${totalStudents === 252 ? '✓ PERFECT' : '⚠️ NEEDS REVIEW'}\n`);

    // Show breakdown by class
    console.log('Breakdown by class:');
    for (const className of classNames) {
      const count = await prisma.student.count({
        where: {
          class: { name: className },
          deletedAt: null
        }
      });
      console.log(`  • ${className}: ${count} students`);
    }

  } catch (e) {
    console.error('\n❌ Fatal error:', e.message);
    console.error(e);
  }

  await prisma.$disconnect();
}

main();
