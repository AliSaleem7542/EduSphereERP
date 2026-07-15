const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fillRemaining() {
  try {
    console.log('🔄 Filling remaining student fees with standard rates...\n');
    
    // Get all students without package details
    const missing = await prisma.student.findMany({
      where: {
        OR: [
          { packageTotal: null },
          { annualCharges: null },
          { tuitionFee: null }
        ]
      },
      select: { id: true, rollNo: true, section: { select: { name: true } } }
    });
    
    console.log(`📊 Students needing fee details: ${missing.length}\n`);
    
    // Define default fees by section type
    const getFeesBySection = (sectionName) => {
      if (!sectionName) return { annual: 8000, tuition: 2000, pkg: 30000 };
      
      if (sectionName.includes('M-') || sectionName.includes('Science') || sectionName.includes('IT-')) {
        return { annual: 8000, tuition: 2500, pkg: 33000 };
      }
      if (sectionName.includes('I.Com') || sectionName.includes('Eco')) {
        return { annual: 8000, tuition: 2200, pkg: 30000 };
      }
      if (sectionName.includes('E-')) {
        return { annual: 8000, tuition: 2000, pkg: 26000 };
      }
      return { annual: 8000, tuition: 2000, pkg: 30000 };
    };
    
    let updated = 0;
    const bySection = {};
    
    for (const student of missing) {
      const fees = getFeesBySection(student.section?.name);
      
      await prisma.student.update({
        where: { id: student.id },
        data: {
          annualCharges: fees.annual,
          tuitionFee: fees.tuition,
          packageTotal: fees.pkg
        }
      });
      
      updated++;
      const sec = student.section?.name || 'Unknown';
      if (!bySection[sec]) bySection[sec] = { count: 0, pkg: 0 };
      bySection[sec].count++;
      bySection[sec].pkg += fees.pkg;
      
      if (updated % 30 === 0) {
        console.log(`✓ Updated ${updated}/${missing.length}...`);
      }
    }
    
    console.log(`\n✅ COMPLETE! Updated ${updated} students\n`);
    
    console.log(`📈 BY SECTION:`);
    for (const [sec, data] of Object.entries(bySection)) {
      console.log(`   ${sec}: ${data.count} students | Total: PKR ${data.pkg.toLocaleString('en-PK')}`);
    }
    
    // Final check
    const allWithFees = await prisma.student.findMany({
      where: {
        AND: [
          { packageTotal: { not: null } },
          { annualCharges: { not: null } },
          { tuitionFee: { not: null } }
        ]
      }
    });
    
    const total = await prisma.student.count();
    console.log(`\n✅ FINAL: ${allWithFees.length}/${total} students have complete fee details`);
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

fillRemaining();
