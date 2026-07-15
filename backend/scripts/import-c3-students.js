require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// C-3: 40 students
const students = [
  { rollNo: '201', name: 'AHTISHAM ALI', section: 'C-3', gender: 'MALE', fatherName: 'MUHAMMAD ARIF', phone: '03167352744' },
  { rollNo: '202', name: 'ZAID BILAL', section: 'C-3', gender: 'MALE', fatherName: 'SHAHID BILAL', phone: '03075024461' },
  { rollNo: '203', name: 'SAMEER SHAHID', section: 'C-3', gender: 'MALE', fatherName: 'SHAHID ALI', phone: '03081481541' },
  { rollNo: '204', name: 'MUHAMMAD KASHAN', section: 'C-3', gender: 'MALE', fatherName: 'ASIF MEHMOOD', phone: '03004746664' },
  { rollNo: '205', name: 'ZAIN UL ABIDEEN', section: 'C-3', gender: 'MALE', fatherName: 'M IFTIKHAR', phone: '03006457620' },
  { rollNo: '206', name: 'MUHAMMAD ZAID', section: 'C-3', gender: 'MALE', fatherName: 'MUHAMMAD AKRAM', phone: '03014252187' },
  { rollNo: '207', name: 'MUAHMMAD HASSAN SHAHZAD', section: 'C-3', gender: 'MALE', fatherName: 'ZAHID ALI', phone: '03327575607' },
  { rollNo: '208', name: 'AMMAR WAHEED', section: 'C-3', gender: 'MALE', fatherName: 'ABDUL WAHEED', phone: '03090335833' },
  { rollNo: '209', name: 'ARHAM SAEED', section: 'C-3', gender: 'MALE', fatherName: 'SAEED NAZIR', phone: '03041516485' },
  { rollNo: '210', name: 'UZAIR AHMAD', section: 'C-3', gender: 'MALE', fatherName: 'WAQAR AHMAD', phone: '03060965974' },
  { rollNo: '211', name: 'M UMER JAVAID', section: 'C-3', gender: 'MALE', fatherName: 'M JAVAID', phone: '03163451274' },
  { rollNo: '212', name: 'MUHAMMAD SUDAIS', section: 'C-3', gender: 'MALE', fatherName: 'ABDUL QAYYUM', phone: '03482767424' },
  { rollNo: '213', name: 'MUHAMMAD AHMAD', section: 'C-3', gender: 'MALE', fatherName: 'MUHAMMAD IMRAN', phone: '03461920910' },
  { rollNo: '214', name: 'MUHAMMAD NABRAS', section: 'C-3', gender: 'MALE', fatherName: 'RASHID MASOOD', phone: '03443562940' },
  { rollNo: '215', name: 'AHMAD RAZA', section: 'C-3', gender: 'MALE', fatherName: 'MUHAMMAD SHAKEEL AHMAD', phone: '03066744531' },
  { rollNo: '216', name: 'HANZALA', section: 'C-3', gender: 'MALE', fatherName: 'M SARWAR', phone: '03291850481' },
  { rollNo: '217', name: 'AHTISHAM UL HAQ', section: 'C-3', gender: 'MALE', fatherName: 'INAM UL HAQ', phone: '03450530452' },
  { rollNo: '218', name: 'MOHSIN ABBAS', section: 'C-3', gender: 'MALE', fatherName: 'MUHAMMAD GUFRAN', phone: '03057200709' },
  { rollNo: '219', name: 'MUHAMMAD IMRAN', section: 'C-3', gender: 'MALE', fatherName: 'MUHAMMAD YAMEEN KHAN', phone: '03194890565' },
  { rollNo: '220', name: 'TAYYAB', section: 'C-3', gender: 'MALE', fatherName: 'IMDADULLAH', phone: '03327144137' },
  { rollNo: '221', name: 'BAKIR MEHDI', section: 'C-3', gender: 'MALE', fatherName: 'QAMAR UL HASSAN', phone: '03332972468' },
  { rollNo: '222', name: 'ABDUL REHMAN', section: 'C-3', gender: 'MALE', fatherName: 'MUHAMMAD NADEEM', phone: '03013201197' },
  { rollNo: '223', name: 'MUHAMMAD AHMAD', section: 'C-3', gender: 'MALE', fatherName: 'MUHAMMAD RAMZAN', phone: '03707020185' },
  { rollNo: '224', name: 'HAFIZ AQIB', section: 'C-3', gender: 'MALE', fatherName: 'MUSHTAQ AHMAD', phone: '03059720481' },
  { rollNo: '225', name: 'IHTISHAM ABDUREHMAN', section: 'C-3', gender: 'MALE', fatherName: 'MAQBOOL AHMED', phone: '03001413480' },
  { rollNo: '226', name: 'MUHAMMAD JOHAR NAWAZ', section: 'C-3', gender: 'MALE', fatherName: 'HAQ NAWAZ', phone: '03117368440' },
  { rollNo: '227', name: 'MUHAMMAD HAMMAD', section: 'C-3', gender: 'MALE', fatherName: 'NADEEM IQBAL', phone: '03058492552' },
  { rollNo: '228', name: 'RANA M. ABDULLAH KHALIL', section: 'C-3', gender: 'MALE', fatherName: 'ZULFIQAR ALI', phone: '03703770506' },
  { rollNo: '229', name: 'RAO ARHAM FAIZ', section: 'C-3', gender: 'MALE', fatherName: 'NASIR', phone: '03356953142' },
  { rollNo: '230', name: 'MUHAMMAD AHMAD RAMZAN', section: 'C-3', gender: 'MALE', fatherName: 'MUHAMMAD RAMZAN', phone: '03046768906' },
  { rollNo: '231', name: 'MUHAMMAD', section: 'C-3', gender: 'MALE', fatherName: 'AFTAB MAHMOOD', phone: '03217788439' },
  { rollNo: '232', name: 'MUHAMMAD ABDULLAH', section: 'C-3', gender: 'MALE', fatherName: 'ZAHID AHMAD KHAN', phone: '03457995484' },
  { rollNo: '233', name: 'FAIZAN JAVED', section: 'C-3', gender: 'MALE', fatherName: 'JAVED IQBAL', phone: '03007299347' },
  { rollNo: '234', name: 'MUHAMMAD SAMRAN', section: 'C-3', gender: 'MALE', fatherName: 'SAFDAR ALI', phone: '03017184396' },
  { rollNo: '235', name: 'ZAIN WAQAR', section: 'C-3', gender: 'MALE', fatherName: 'NASEER AHMAD', phone: '03047257635' },
  { rollNo: '236', name: 'MUHAMMAD SHAHWAIZ', section: 'C-3', gender: 'MALE', fatherName: 'ZULFIQAR ALI', phone: '03336233066' },
  { rollNo: '237', name: 'MUHAMMAD TALHA', section: 'C-3', gender: 'MALE', fatherName: 'MUHAMMAD AKRAM', phone: '03154584452' },
  { rollNo: '238', name: 'KASHIF RAZA', section: 'C-3', gender: 'MALE', fatherName: 'M SADIQUE ARAIN', phone: '03367277276' },
  { rollNo: '239', name: 'MUHAMMAD MAMOON', section: 'C-3', gender: 'MALE', fatherName: 'ABDUL QAYYUM', phone: '03458679606' },
  { rollNo: '240', name: 'MUHAMMAD FAIZAN', section: 'C-3', gender: 'MALE', fatherName: 'MUHAMMAD RAFIQUE', phone: '03007987659' },
];

async function main() {
  try {
    const ay = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
    const cls = await prisma.class.findFirst({ where: { name: '1st Year' } });

    let section = await prisma.section.findFirst({
      where: { name: 'C-3', classId: cls.id }
    });
    if (!section) {
      section = await prisma.section.create({
        data: { name: 'C-3', classId: cls.id }
      });
    }

    let imported = 0;
    for (const stu of students) {
      try {
        const nameParts = stu.name.trim().split(/\s+/);
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || '';

        let phone = (stu.phone || '').trim();
        if (phone && !phone.startsWith('0')) phone = '0' + phone;
        if (!phone || phone === '0') phone = null;

        await prisma.student.create({
          data: {
            rollNo: stu.rollNo,
            firstName,
            lastName,
            gender: stu.gender,
            fatherName: stu.fatherName,
            fatherPhone: phone,
            feeCategory: 'REGULAR',
            classId: cls.id,
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
        process.stdout.write('✗');
      }
    }

    console.log(`\n✅ C-3: ${imported}/40 imported\n`);
    await prisma.$disconnect();
  } catch (e) {
    console.error('Error:', e.message);
  }
}

main();
