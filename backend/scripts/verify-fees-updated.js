const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  try {
    const withFees = await prisma.student.count({
      where: {
        AND: [
          { packageTotal: { not: null } },
          { annualCharges: { not: null } }
        ]
      }
    });
    
    const total = await prisma.student.count();
    const sample = await prisma.student.findMany({
      where: { packageTotal: { not: null } },
      select: { rollNo: true, firstName: true, packageTotal: true, annualCharges: true, tuitionFee: true, section: { select: { name: true } } },
      take: 15
    });
    
    console.log(`✅ Students with fee details: ${withFees}/${total}`);
    console.log(`\n📊 Sample updated students:\n`);
    
    sample.forEach(s => {
      console.log(`${s.section?.name}-${s.rollNo}: ${s.firstName}`);
      console.log(`   Annual: ${s.annualCharges || '-'} | Tuition: ${s.tuitionFee || '-'} | Package: ${s.packageTotal || '-'}`);
    });
    
  } finally {
    await prisma.$disconnect();
  }
}

verify();
