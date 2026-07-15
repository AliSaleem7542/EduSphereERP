const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkStudents() {
  try {
    const sections = await prisma.section.findMany({
      include: { students: { select: { id: true, rollNo: true } } },
      orderBy: { name: 'asc' }
    });
    
    console.log('📊 STUDENTS BY SECTION:\n');
    let total = 0;
    for (const sec of sections) {
      console.log(`${sec.name}: ${sec.students.length} students`);
      total += sec.students.length;
    }
    
    console.log(`\n✅ Total Students: ${total}`);
    
    // Check students with empty package details
    const noPackage = await prisma.student.findMany({
      where: {
        AND: [
          { packageTotal: null },
          { OR: [ { annualCharges: null }, { tuitionFee: null } ] }
        ]
      },
      select: { id: true, rollNo: true, section: { select: { name: true } } },
      take: 10
    });
    
    console.log(`\n⚠️ Students without package details: ${noPackage.length} (showing first 10)`);
    noPackage.forEach(s => {
      console.log(`   ${s.section?.name}-${s.rollNo}`);
    });
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkStudents();
