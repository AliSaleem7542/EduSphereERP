require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const students = [
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
];

async function main() {
  try {
    const ay = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
    const cls = await prisma.class.findFirst({ where: { name: '1st Year' } });

    let section = await prisma.section.findFirst({ where: { name: 'C-4', classId: cls.id } });
    if (!section) section = await prisma.section.create({ data: { name: 'C-4', classId: cls.id } });

    let imported = 0;
    for (const stu of students) {
      try {
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

    console.log(`\n✅ C-4: ${imported}/34 imported\n`);
    await prisma.$disconnect();
  } catch (e) { console.error('Error:', e.message); }
}

main();
