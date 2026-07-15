const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  const count = await prisma.student.count({ where: { packageTotal: { not: null } } });
  const total = await prisma.student.count();
  console.log(`✅ ${count}/${total} students with fees`);
  process.exit(0);
}

verify().catch(e => { console.error(e.message); process.exit(1); });
