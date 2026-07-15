require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Complete data parsed from your list
const studentsData = [
  // C-1 Section (Female students)
  { rollNo: '201', name: 'AMAN KHAN', section: 'C-1', gender: 'FEMALE', fatherName: 'RANA TASLEEM', phone: '033366997' },
  { rollNo: '202', name: 'NIMRA BASHIR', section: 'C-1', gender: 'FEMALE', fatherName: 'BASHIR AHMAD ZAHID', phone: '03408653449' },
  { rollNo: '203', name: 'MUNTAHA NOOR', section: 'C-1', gender: 'FEMALE', fatherName: 'MUHAMMAD RIZWAN', phone: '03187018942' },
  { rollNo: '204', name: 'ROMAAN AFZAAL', section: 'C-1', gender: 'FEMALE', fatherName: 'MUHAMMAD AFZAAL', phone: '03036227655' },
  { rollNo: '205', name: 'MARYAM NAZIR', section: 'C-1', gender: 'FEMALE', fatherName: 'NAZIR AHMAD', phone: '03007667564' },
  { rollNo: '206', name: 'ANAMTA HAYAT', section: 'C-1', gender: 'FEMALE', fatherName: 'MUHAMMAD HAYAT KHAN', phone: '03134690929' },
  { rollNo: '207', name: 'UME RUMAN', section: 'C-1', gender: 'FEMALE', fatherName: 'SHAHID ALI', phone: '0' },
  { rollNo: '208', name: 'MARIUM IDREES', section: 'C-1', gender: 'FEMALE', fatherName: 'IDREES AHMED', phone: '0' },
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
  { rollNo: '219', name: 'SEHAR GHAFFAR', section: 'C-1', gender: 'FEMALE', fatherName: 'ABDUL GHAFFAR', phone: '0' },
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

  // M-1 Section (Mixed)
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
  { rollNo: '111', name: 'HAMNA ANDLEEB', section: 'M-1', gender: 'FEMALE', fatherName: 'MUHAMMAD MAJIDULLAH', phone: '0' },
  { rollNo: '112', name: 'SHAKEELA SHAHEEN', section: 'M-1', gender: 'FEMALE', fatherName: 'MUHAMMAD MANSHA', phone: '03705291601' },
  { rollNo: '113', name: 'HOORAIN FATIMA', section: 'M-1', gender: 'FEMALE', fatherName: 'MUHAMMAD NASEEM', phone: '03221560460' },
  { rollNo: '114', name: 'DUA IMRAN', section: 'M-1', gender: 'FEMALE', fatherName: 'IMRAN SARWAR', phone: '03007286740' },
  { rollNo: '115', name: 'ZAINAB MASOOD', section: 'M-1', gender: 'FEMALE', fatherName: 'MASOOD', phone: '03009411502' },
  { rollNo: '116', name: 'ALIA ASLAM', section: 'M-1', gender: 'FEMALE', fatherName: 'MUHAMMAD ASLAM', phone: '03476497543' },
  { rollNo: '117', name: 'ALISHA SALEEM', section: 'M-1', gender: 'FEMALE', fatherName: 'MUHAMMAD SALEEM', phone: '03067699589' },
  { rollNo: '118', name: 'HABIBA SAKHAWAT', section: 'M-1', gender: 'FEMALE', fatherName: 'SAKHAWAT ALI', phone: '03041368442' },
  { rollNo: '119', name: 'MAHEEN MUNEER', section: 'M-1', gender: 'FEMALE', fatherName: 'MUNEER', phone: '03241528142' },
  { rollNo: '120', name: 'SIDRA SHOUKAT', section: 'M-1', gender: 'FEMALE', fatherName: 'SHOUKAT ALI', phone: '03187074228' },
];

async function main() {
  console.log('📚 Batch importing students...\n');

  try {
    const ay = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
    const classObj = await prisma.class.findFirst({ where: { name: '1st Year' } });

    if (!classObj) throw new Error('Class not found');

    let imported = 0;

    for (const stu of studentsData) {
      try {
        // Get or create section
        let section = await prisma.section.findFirst({
          where: { name: stu.section, classId: classObj.id }
        });

        if (!section) {
          section = await prisma.section.create({
            data: { name: stu.section, classId: classObj.id }
          });
        }

        // Parse name
        const nameParts = stu.name.trim().split(/\s+/);
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');

        // Format phone
        let phone = (stu.phone || '').trim();
        if (phone && phone !== '0' && !phone.startsWith('0')) {
          phone = '0' + phone;
        } else if (!phone || phone === '0') {
          phone = null;
        }

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
        process.stdout.write('✗');
      }
    }

    console.log(`\n\n✅ Imported ${imported}/${studentsData.length} students`);

  } catch (e) {
    console.error('❌ Error:', e.message);
  }

  await prisma.$disconnect();
}

main();
