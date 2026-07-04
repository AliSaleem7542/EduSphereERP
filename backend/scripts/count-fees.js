const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const active = await prisma.feeRecord.count({ where: { deletedAt: null } });
  const deleted = await prisma.feeRecord.count({ where: { deletedAt: { not: null } } });
  
  console.log('\n📊 FEE RECORDS COUNT\n');
  console.log('✅ Active Fee Records:', active);
  console.log('🗑️  Soft Deleted Fee Records:', deleted);
  console.log('📊 Total Fee Records:', active + deleted);
  console.log('');
  
  await prisma.$disconnect();
})();
