require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const c5Students = [
  { rollNo: '401', name: 'ZEESHAN ALI', section: 'C-5', gender: 'MALE', fatherName: 'MUSHTAQ ALI', phone: '03426182146' },
  { rollNo: '402', name: 'SAMAR ABBAS', section: 'C-5', gender: 'MALE', fatherName: 'ABDUL KHALIQ', phone: '03281995774' },
  { rollNo: '403', name: 'MUHAMMAD HAMZA YOUNIS', section: 'C-5', gender: 'MALE', fatherName: 'MUHAMMAD YOUNIS', phone: '03007982117' },
  { rollNo: '404', name: 'HAFIZ UMAIS NISAR', section: 'C-5', gender: 'MALE', fatherName: 'HAFIZ NISAR AHMAD', phone: '03007982117' },
  { rollNo: '405', name: 'ABDUL WAHAB', section: 'C-5', gender: 'MALE', fatherName: 'ABDUL RAZZAQ', phone: '03053370963' },
  { rollNo: '406', name: 'MUHAMMAD IKRAM', section: 'C-5', gender: 'MALE', fatherName: 'IMRAN KHAN', phone: '03212890467' },
  { rollNo: '407', name: 'HAMZA ISHFAQ', section: 'C-5', gender: 'MALE', fatherName: 'MUHAMMAD ISHFAQ', phone: '03075874868' },
  { rollNo: '408', name: 'AHMAD RAZA', section: 'C-5', gender: 'MALE', fatherName: 'GULZAR AHMAD', phone: '03187419645' },
  { rollNo: '409', name: 'UMAIR LIAQAT', section: 'C-5', gender: 'MALE', fatherName: 'LIAQAT ALI', phone: '03322160300' },
  { rollNo: '410', name: 'MUHAMMAD HARIS', section: 'C-5', gender: 'MALE', fatherName: 'MUHAMMAD ASHRAF', phone: '03004240464' },
  { rollNo: '411', name: 'MUHAMMAD SAAD JAVAID', section: 'C-5', gender: 'MALE', fatherName: 'JAVAID IQBAL', phone: '' },
  { rollNo: '412', name: 'M FIAZ ABDULLAH', section: 'C-5', gender: 'MALE', fatherName: 'MIAN MUHAMMAD RIAZ', phone: '' },
  { rollNo: '413', name: 'MUHAMMAD FAHAD', section: 'C-5', gender: 'MALE', fatherName: 'MUHAMMAD ADREES', phone: '03057265670' },
  { rollNo: '414', name: 'ABDULLAH NAWAZ', section: 'C-5', gender: 'MALE', fatherName: 'MUHAMMAD NAWAZ', phone: '03414599453' },
  { rollNo: '415', name: 'MUHAMMAD HUSSNAIN', section: 'C-5', gender: 'MALE', fatherName: 'SALAHUDIN', phone: '03000570262' },
  { rollNo: '416', name: 'ASAD ALI', section: 'C-5', gender: 'MALE', fatherName: 'MUHAMMAD AKRAM', phone: '' },
  { rollNo: '417', name: 'MUHAMMAD MUSTAFA', section: 'C-5', gender: 'MALE', fatherName: 'MUHAMMAD ZAULFIQAR', phone: '' },
  { rollNo: '418', name: 'MUHAMMAD WASIF', section: 'C-5', gender: 'MALE', fatherName: 'SARDAR', phone: '' },
  { rollNo: '419', name: 'MUHAMMAD HASSAM', section: 'C-5', gender: 'MALE', fatherName: 'ZULFIQAR ALI', phone: '03484115091' },
];

const m4Students = [
  { rollNo: '101', name: 'RANA FRAZ BILAL', section: 'M-4', gender: 'MALE', fatherName: 'RANA BILAL HUSSAIN', phone: '03016374800' },
  { rollNo: '102', name: 'MUHAMMAD MUEEZ RAZA', section: 'M-4', gender: 'MALE', fatherName: 'MUHAMMAD RAZA', phone: '03417995148' },
  { rollNo: '103', name: 'HUSSAIN ASHRAF', section: 'M-4', gender: 'MALE', fatherName: 'MUHAMMAD ASHRAF', phone: '03216082142' },
  { rollNo: '104', name: 'MUHAMMAD ABUBAKAR SADDIQUE', section: 'M-4', gender: 'MALE', fatherName: 'KHIZAR HAYAT', phone: '03453435249' },
  { rollNo: '105', name: 'MUHAMMAD FAROOQ', section: 'M-4', gender: 'MALE', fatherName: 'YOUSAF ALI', phone: '03436040439' },
  { rollNo: '106', name: 'HAMMAD NAWAZ', section: 'M-4', gender: 'MALE', fatherName: 'MUHAMMAD NAWAZ', phone: '03463598430' },
  { rollNo: '107', name: 'ZAIN ASHIQ', section: 'M-4', gender: 'MALE', fatherName: 'MUHAMMAD ASHIQ', phone: '03438279067' },
  { rollNo: '108', name: 'ZAYYAN AHMAD', section: 'M-4', gender: 'MALE', fatherName: 'SALEEM NAWAZ', phone: '03357908810' },
  { rollNo: '109', name: 'ABDULLAH ZAHID', section: 'M-4', gender: 'MALE', fatherName: 'ZAHID AHMAD KHAN', phone: '03023439412' },
  { rollNo: '110', name: 'M AHSAN', section: 'M-4', gender: 'MALE', fatherName: 'M. IMRAN', phone: '03069850021' },
  { rollNo: '111', name: 'ABDULLAH FAROOQ', section: 'M-4', gender: 'MALE', fatherName: 'AMJAD FAROOQ', phone: '03095586023' },
  { rollNo: '112', name: 'ZOHAIB HUSSAIN', section: 'M-4', gender: 'MALE', fatherName: 'MUHAMMAD MOHSIN HUSSAIN', phone: '03026088094' },
  { rollNo: '113', name: 'MUHAMMAD HASSAN MUSTAFA', section: 'M-4', gender: 'MALE', fatherName: 'GHULAM MUSTAFA ANWAR', phone: '03083703214' },
  { rollNo: '114', name: 'MUHAMMAD AHSAN', section: 'M-4', gender: 'MALE', fatherName: 'HABIBULLAH', phone: '03328059203' },
  { rollNo: '115', name: 'AHMAD RAZA', section: 'M-4', gender: 'MALE', fatherName: 'MUHAMMAD SARDAR', phone: '03700428540' },
  { rollNo: '116', name: 'SAAD MEHMOOD', section: 'M-4', gender: 'MALE', fatherName: 'GHULAM MEHMOOD', phone: '' },
  { rollNo: '117', name: 'MUJEEB TARIQ', section: 'M-4', gender: 'MALE', fatherName: 'TARIQ MEHMOOD', phone: '03484966217' },
  { rollNo: '118', name: 'HAFIZ MUHAMMAD SOHAIB', section: 'M-4', gender: 'MALE', fatherName: 'KHALIL UR REHMAN', phone: '03004524028' },
  { rollNo: '119', name: 'MUHAMMAD HAMMAD', section: 'M-4', gender: 'MALE', fatherName: 'MUHAMMAD IFTIKHAR', phone: '03326492015' },
  { rollNo: '120', name: 'M AHSAN SALEEM', section: 'M-4', gender: 'MALE', fatherName: 'M SALEEM', phone: '03442580031' },
  { rollNo: '121', name: 'MUHAMMAD ABUBAKAR', section: 'M-4', gender: 'MALE', fatherName: 'MUHAMMAD IBRAR KHAN', phone: '03067429164' },
  { rollNo: '122', name: 'TABASSUM RASOOL', section: 'M-4', gender: 'MALE', fatherName: 'MUHAMMAD ISMAIL', phone: '03039510207' },
  { rollNo: '123', name: 'MUHAMMAD ATHER NASEEB', section: 'M-4', gender: 'MALE', fatherName: 'MUHAMMAD TARIQ', phone: '03017072213' },
  { rollNo: '124', name: 'SYED RYEET ABBAS', section: 'M-4', gender: 'MALE', fatherName: 'SYED KHAWER ABBAS', phone: '03009807586' },
  { rollNo: '125', name: 'MUHAMMAD UMER', section: 'M-4', gender: 'MALE', fatherName: 'ABDUL ALEEM', phone: '03064844452' },
];

async function main() {
  try {
    const ay = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
    const cls = await prisma.class.findFirst({ where: { name: '1st Year' } });

    for (const sectionName of ['C-5', 'M-4']) {
      let section = await prisma.section.findFirst({ where: { name: sectionName, classId: cls.id } });
      if (!section) section = await prisma.section.create({ data: { name: sectionName, classId: cls.id } });
    }

    let imported = 0;
    const allStudents = [...c5Students, ...m4Students];

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

    console.log(`\n✅ C-5 + M-4: ${imported}/44 imported\n`);
    await prisma.$disconnect();
  } catch (e) { console.error('Error:', e.message); }
}

main();
