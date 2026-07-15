const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const active = await prisma.student.count({ where: { deletedAt: null } });
  const deleted = await prisma.student.count({ where: { deletedAt: { not: null } } });
  
  console.log('\n📊 STUDENT COUNT SUMMARY\n');
  console.log('✅ Active Students:', active);
  console.log('🗑️  Soft Deleted Students:', deleted);
  console.log('📊 Total Students:', active + deleted);
  console.log('');
  
  await prisma.$disconnect();
})();
