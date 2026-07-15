require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const e2Students = [
  { rollNo: '501', name: 'MUHAMMAD HAMMAD', section: 'E-2', gender: 'MALE', fatherName: 'MUHAMMAD MANSHA', phone: '03026344476' },
  { rollNo: '502', name: 'NAVEED ANJUM', section: 'E-2', gender: 'MALE', fatherName: 'MUHAMMAD SHAKEEL AHMAD', phone: '03066744531' },
  { rollNo: '503', name: 'MUHAMMAD SUFYAN', section: 'E-2', gender: 'MALE', fatherName: 'MUHAMMAD RAFIQUE', phone: '03260064442' },
  { rollNo: '504', name: 'MUHAMMAD SAMI', section: 'E-2', gender: 'MALE', fatherName: 'MUKHTAR ALI', phone: '03104401283' },
  { rollNo: '505', name: 'MUHAMMAD HAMMAD NAZIR', section: 'E-2', gender: 'MALE', fatherName: 'SHOUKAT ALI', phone: '03154850484' },
  { rollNo: '506', name: 'MUHAMMAD FAIZAN ANWAR', section: 'E-2', gender: 'MALE', fatherName: 'MUHAMMAD ANWAR', phone: '03446164463' },
  { rollNo: '507', name: 'ZAID', section: 'E-2', gender: 'MALE', fatherName: 'MUBASHIR IQBAL', phone: '03271274533' },
  { rollNo: '508', name: 'FAIZAN', section: 'E-2', gender: 'MALE', fatherName: 'MUHAMMAD HUSSAIN', phone: '03024711632' },
  { rollNo: '509', name: 'IHSANULLAH', section: 'E-2', gender: 'MALE', fatherName: 'SAIFULLAH', phone: '03057456506' },
  { rollNo: '510', name: 'AKASHA FAROOQ', section: 'E-2', gender: 'MALE', fatherName: 'SANAULLAH', phone: '03046788911' },
  { rollNo: '511', name: 'WASIF ALI', section: 'E-2', gender: 'MALE', fatherName: 'MUHAMMAD ALI', phone: '03467463530' },
  { rollNo: '512', name: 'UMAR SADDIQUE', section: 'E-2', gender: 'MALE', fatherName: 'MUHAMMAD SADDIQUE', phone: '03492278139' },
  { rollNo: '513', name: 'ARSLAN BASHIR', section: 'E-2', gender: 'MALE', fatherName: 'MUHAMMAD BASHIR', phone: '03421752573' },
  { rollNo: '514', name: 'FARRUKH IJAZ', section: 'E-2', gender: 'MALE', fatherName: 'IJAZ AHMAD', phone: '03057275466' },
  { rollNo: '515', name: 'ALI SHAN', section: 'E-2', gender: 'MALE', fatherName: 'GHULAM HUSSAIN', phone: '03367790142' },
  { rollNo: '516', name: 'ZOHAIB ANWAR', section: 'E-2', gender: 'MALE', fatherName: 'RIAZ AHMAD KHAN', phone: '03057565726' },
  { rollNo: '517', name: 'MUHAMMAD SHERAZ', section: 'E-2', gender: 'MALE', fatherName: 'ANEES AHMAD', phone: '03036379198' },
  { rollNo: '518', name: 'GHULAM HAIDER', section: 'E-2', gender: 'MALE', fatherName: 'MUHAMMAD RASHEED', phone: '03427734397' },
  { rollNo: '519', name: 'DAWOOD IMRAN', section: 'E-2', gender: 'MALE', fatherName: 'IMRAN', phone: '03250088452' },
];

const it2Students = [
  { rollNo: '301', name: 'MUHAMMAD ALEEM SAJID', section: 'IT-2', gender: 'MALE', fatherName: 'MUHAMMD SAJID', phone: '03223802341' },
  { rollNo: '302', name: 'M. SOHAIB', section: 'IT-2', gender: 'MALE', fatherName: 'ABDUL SATTAR', phone: '03045060935' },
  { rollNo: '303', name: 'USMAN FAROOQ', section: 'IT-2', gender: 'MALE', fatherName: 'MUHAMMAD FAROOQ', phone: '03013953100' },
  { rollNo: '304', name: 'TAHA HUSSAIN', section: 'IT-2', gender: 'MALE', fatherName: 'GHULAM MUSTAFA', phone: '03261806533' },
  { rollNo: '305', name: 'ABDUL REHMAN', section: 'IT-2', gender: 'MALE', fatherName: 'MUHAMMAD RAMZAN', phone: '03261546919' },
  { rollNo: '306', name: 'ALI MURTAZA', section: 'IT-2', gender: 'MALE', fatherName: 'M ASLAM', phone: '03013207088' },
  { rollNo: '307', name: 'UZAIR ANWAR', section: 'IT-2', gender: 'MALE', fatherName: 'MUHAMMAD ANWAR', phone: '03414012689' },
  { rollNo: '308', name: 'ZULFIQAR', section: 'IT-2', gender: 'MALE', fatherName: 'SALAMAT ALI', phone: '' },
  { rollNo: '309', name: 'SHAHID REHMAN', section: 'IT-2', gender: 'MALE', fatherName: 'ABDUL REHMAN', phone: '03077565325' },
  { rollNo: '310', name: 'HAMZA ISLAM', section: 'IT-2', gender: 'MALE', fatherName: 'ABDUL ISLAM', phone: '03428460479' },
  { rollNo: '311', name: 'SAMIULLAH', section: 'IT-2', gender: 'MALE', fatherName: 'MUHAMMAD NASARULLAH', phone: '03027950461' },
  { rollNo: '312', name: 'MUHAMMAD SUBHAN', section: 'IT-2', gender: 'MALE', fatherName: 'SARFRAZ AHMAD', phone: '' },
  { rollNo: '313', name: 'DAWOOD MASIH', section: 'IT-2', gender: 'MALE', fatherName: 'SALEEM MASIH', phone: '03408759003' },
  { rollNo: '314', name: 'MUHAMMAD AOUN', section: 'IT-2', gender: 'MALE', fatherName: 'AURANGZAIB', phone: '' },
];

async function main() {
  try {
    const ay = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
    const cls = await prisma.class.findFirst({ where: { name: '1st Year' } });

    for (const sectionName of ['E-2', 'IT-2']) {
      let section = await prisma.section.findFirst({ where: { name: sectionName, classId: cls.id } });
      if (!section) section = await prisma.section.create({ data: { name: sectionName, classId: cls.id } });
    }

    let imported = 0;
    const allStudents = [...e2Students, ...it2Students];

    for (const stu of allStudents) {
      try {
        const section = await prisma.section.findFirst({ where: { name: stu.section, classId: cls.id } });
        const nameParts = stu.name.trim().split(/\s+/);
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || '';
        let phone = (stu.phone || '').trim();
        if (phone && !phone.startsWith('0')) phone = '0' + phone;
        if (!phone) phone = null;

        await prisma.student.create({
          data: { rollNo: stu.rollNo, firstName, lastName, gender: stu.gender, fatherName: stu.fatherName, fatherPhone: phone, feeCategory: 'REGULAR', classId: cls.id, sectionId: section.id, academicYearId: ay.id, admissionDate: new Date('2025-04-01'), admissionType: 'NEW', status: 'ACTIVE', isActive: true }
        });
        imported++;
        process.stdout.write('.');
      } catch (e) { process.stdout.write('✗'); }
    }

    console.log(`\n✅ E-2 + IT-2: ${imported}/33 imported\n`);
    await prisma.$disconnect();
  } catch (e) { console.error('Error:', e.message); }
}

main();
