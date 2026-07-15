require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Batch data structure - organized by section
const batchData = {
  'C-1': [
    ['201', 'AMAN KHAN', 'FEMALE', 'RANA TASLEEM', '033366997'],
    ['202', 'NIMRA BASHIR', 'FEMALE', 'BASHIR AHMAD ZAHID', '03408653449'],
    ['203', 'MUNTAHA NOOR', 'FEMALE', 'MUHAMMAD RIZWAN', '03187018942'],
    ['204', 'ROMAAN AFZAAL', 'FEMALE', 'MUHAMMAD AFZAAL', '03036227655'],
    ['205', 'MARYAM NAZIR', 'FEMALE', 'NAZIR AHMAD', '03007667564'],
    ['206', 'ANAMTA HAYAT', 'FEMALE', 'MUHAMMAD HAYAT KHAN', '03134690929'],
    ['207', 'UME RUMAN', 'FEMALE', 'SHAHID ALI', ''],
    ['208', 'MARIUM IDREES', 'FEMALE', 'IDREES AHMED', ''],
    ['209', 'FATIMA ASHRAF', 'FEMALE', 'MUHAMMAD ASHRAF', '03026004748'],
    ['210', 'AREEBA SHAHID', 'FEMALE', 'SHAHID ALI', '03167571109'],
    ['211', 'MARIYAM ZAFAR', 'FEMALE', 'ZAFAR ALI', '03446962377'],
    ['212', 'BUSHRA ILYAS', 'FEMALE', 'MUHAMMAD ILYAS', '03427817465'],
    ['213', 'NOOR FATIMA', 'FEMALE', 'AZIZULLAH', '03240849615'],
    ['214', 'AROOJ FATIMA', 'FEMALE', 'KASHIF LATIF', '03067909875'],
    ['215', 'AMINA BABAR', 'FEMALE', 'BABAR IFTIKHAR', '03064849043'],
    ['216', 'MEMONA NAWAZ', 'FEMALE', 'MUHAMMAD NAWAZ', '03007912269'],
    ['217', 'AREEBA SHOUKAT', 'FEMALE', 'SHOUKAT ALI', '03177030465'],
    ['218', 'SANA YOUSAF', 'FEMALE', 'YOUSAF', '03447635457'],
    ['219', 'SEHAR GHAFFAR', 'FEMALE', 'ABDUL GHAFFAR', ''],
    ['220', 'ZARA AKBAR', 'FEMALE', 'MUHAMMAD AKBAR', '03349666605'],
    ['221', 'AYESHA PARVEEN', 'FEMALE', 'MUHAMMAD ASIF', '03004677141'],
    ['222', 'UMME KHADIJA', 'FEMALE', 'MUMTAZ ALI', '03128347080'],
    ['223', 'SHUMAILA', 'FEMALE', 'ABDUL MAJEED', '03074671122'],
    ['224', 'SAWAIRA NASEER', 'FEMALE', 'NASEER AHMAD', '03047257635'],
    ['225', 'EMAN FATIMA', 'FEMALE', 'SABIR HUSSAIN', '03473418404'],
    ['226', 'HIRA NOOR', 'FEMALE', 'ZULFIQAR ALI', '03368649732'],
    ['227', 'AFIA ABDUL SAMAD', 'FEMALE', 'ABDUL SAMAD', '03067030336'],
    ['228', 'MAROOSH FATIMA', 'FEMALE', 'JAFIR IQBAL', '03291015016'],
    ['229', 'AMINA BIBI', 'FEMALE', 'MUHAMMAD BINYAMEEN', '03281695390'],
    ['230', 'MUNIHA MUZAMMIL', 'FEMALE', 'MUZAMMIL', '03441777009'],
    ['231', 'RASHMAL IMRAN', 'FEMALE', 'IMRAN SHARIF', '03089156114'],
    ['232', 'DUA FATIMA', 'FEMALE', 'RAO MUJAHID', '03267126519'],
    ['233', 'MARYAM SULTAN', 'FEMALE', 'SULTAN MEHMOOD', '03060668192'],
  ],
  'M-1': [
    ['101', 'FEHA MURTAZA', 'FEMALE', 'GHULAM MURTAZA', '03049144847'],
    ['102', 'AYESHA MURSALEEN', 'FEMALE', 'M MURSALEEN', '03000797136'],
    ['103', 'KASHMAIL IRFAN', 'FEMALE', 'MUHAMMAD IRFAN', '03056058124'],
    ['104', 'WAJIHA FATIMA', 'FEMALE', 'TOUQEER AHMAD', '03070334500'],
    ['105', 'SABA FIRDOUS', 'FEMALE', 'MUHAMMAD SARDAR', '03026096345'],
    ['106', 'FARWA JAVED', 'FEMALE', 'JAVED IQBAL', '03004847918'],
    ['107', 'AFRAH ALVI', 'FEMALE', 'MUHAMMAD YASIR ALVI', '03291852390'],
    ['108', 'ANFAAL ASHIQ', 'FEMALE', 'ASHIQ ALI', '03451888218'],
    ['109', 'RAMIZA ASIF', 'FEMALE', 'ASIF ALI', '03057462290'],
    ['110', 'EZZA RUBAB', 'FEMALE', 'TASAWAR ABBAS', '03476725453'],
    ['111', 'HAMNA ANDLEEB', 'FEMALE', 'MUHAMMAD MAJIDULLAH', ''],
    ['112', 'SHAKEELA SHAHEEN', 'FEMALE', 'MUHAMMAD MANSHA', '03705291601'],
    ['113', 'HOORAIN FATIMA', 'FEMALE', 'MUHAMMAD NASEEM', '03221560460'],
    ['114', 'DUA IMRAN', 'FEMALE', 'IMRAN SARWAR', '03007286740'],
    ['115', 'ZAINAB MASOOD', 'FEMALE', 'MASOOD', '03009411502'],
    ['116', 'ALIA ASLAM', 'FEMALE', 'MUHAMMAD ASLAM', '03476497543'],
    ['117', 'ALISHA SALEEM', 'FEMALE', 'MUHAMMAD SALEEM', '03067699589'],
    ['118', 'HABIBA SAKHAWAT', 'FEMALE', 'SAKHAWAT ALI', '03041368442'],
    ['119', 'MAHEEN MUNEER', 'FEMALE', 'MUNEER', '03241528142'],
    ['120', 'SIDRA SHOUKAT', 'FEMALE', 'SHOUKAT ALI', '03187074228'],
    ['121', 'MUNEEBA AHMAD', 'FEMALE', 'AHMAD HAYAT', '03003915547'],
    ['122', 'FATIMA SHAHID', 'FEMALE', 'MUHAMMAD SHAHID PARVAIZ', '03017125415'],
    ['123', 'AQSA JAMIL', 'FEMALE', 'MUHAMMAD JAMIL', '03320666820'],
    ['124', 'EZA FAKHRA', 'FEMALE', 'GHULAM HUSSAIN', '03457909453'],
    ['125', 'UMM E HABIBA', 'FEMALE', 'MUHAMMAD JAVED ANWAR', '03444977385'],
    ['126', 'HINA TARIQ', 'FEMALE', 'TARIQ MEHMOOD', '03401456000'],
    ['127', 'AROOJ FATIMA', 'FEMALE', 'GHULAM GHOUS', '03077011441'],
    ['128', 'ZOHA RASHEED', 'FEMALE', 'RASHEED', '03007245142'],
    ['129', 'KHADIJA IRFAN', 'FEMALE', 'MUHAMMAD IRFAN', '03447017790'],
    ['130', 'ZAINAB BIBI', 'FEMALE', 'FAYYAZ AHMAD', ''],
    ['131', 'LAIBA AKBAR', 'FEMALE', 'AKBAR ALI', '03039510207'],
    ['132', 'AROOBA RAFIQUE', 'FEMALE', 'MUHAMMAD RAFIQUE', '03413617541'],
    ['133', 'ALEENA NADEEM', 'FEMALE', 'MUHAMMAD NADEEM', '03457190471'],
    ['134', 'NOOR UL EMAN', 'FEMALE', 'MUHAMMAD IRFAN', '03447017790'],
    ['135', 'BARIRA ASLAM', 'FEMALE', 'MUHAMMAD ASLAM', '03155669469'],
    ['136', 'HUSNA', 'FEMALE', 'FAKHAR ABBAS', ''],
    ['137', 'HAFSA KHIZAR', 'FEMALE', 'KHIZER HAYAT', '03414606713'],
    ['138', 'MINAHIL FATIMA', 'FEMALE', 'IKHLAQ AHMAD', '03117538143'],
    ['139', 'EMAAN FATIMA', 'FEMALE', 'RAIZ AHMAD', '03454180053'],
    ['140', 'IMAN RAMZAN', 'FEMALE', 'RAMZAN', '03096376624'],
    ['141', 'ISHWA YOUSAF', 'FEMALE', 'MUHAMMAD YOUSAF', '03167100325'],
    ['142', 'ROMAIZAH', 'FEMALE', 'MUHAMMAD AMJAD', '03457817452'],
    ['143', 'AMINA SAJJID', 'FEMALE', 'MUHAMMAD BOTTA', ''],
    ['144', 'MEHWISH ALI SHER', 'FEMALE', 'ALI SHER', '03468721402'],
  ]
};

async function importBatch() {
  console.log('\n📚 BATCH IMPORT - 1st Year Students\n');

  try {
    const ay = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
    const classObj = await prisma.class.findFirst({ where: { name: '1st Year' } });

    if (!classObj) throw new Error('1st Year class not found');

    let totalImported = 0;

    for (const [sectionName, students] of Object.entries(batchData)) {
      console.log(`\n📌 Importing ${sectionName}...`);

      let section = await prisma.section.findFirst({
        where: { name: sectionName, classId: classObj.id }
      });

      if (!section) {
        section = await prisma.section.create({
          data: { name: sectionName, classId: classObj.id }
        });
      }

      let count = 0;

      for (const [rollNo, name, gender, fatherName, phone] of students) {
        try {
          const [firstName, ...lastParts] = name.trim().split(/\s+/);
          const lastName = lastParts.join(' ');
          const formattedPhone = phone ? '0' + phone.replace(/^0+/, '') : null;

          await prisma.student.create({
            data: {
              rollNo,
              firstName,
              lastName,
              gender,
              fatherName,
              fatherPhone: formattedPhone,
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

          count++;
          process.stdout.write('.');
        } catch (e) {
          process.stdout.write('✗');
        }
      }

      console.log(` ✓ ${count} students`);
      totalImported += count;
    }

    console.log(`\n\n${'='.repeat(50)}`);
    console.log(`✅ IMPORT COMPLETE: ${totalImported} students`);
    console.log(`${'='.repeat(50)}\n`);

  } catch (e) {
    console.error('❌ Error:', e.message);
  }

  await prisma.$disconnect();
}

importBatch();
