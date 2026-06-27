const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const students = await prisma.student.findMany({
    orderBy: { id: 'desc' },
    take: 10,
    select: {
      id: true,
      rollNo: true,
      firstName: true,
      lastName: true,
      createdAt: true
    }
  });
  
  console.log('Last 10 students:');
  students.forEach(s => {
    console.log(`ID: ${s.id}, Roll: ${s.rollNo}, Name: ${s.firstName} ${s.lastName}, Created: ${s.createdAt}`);
  });
  
  const total = await prisma.student.count();
  console.log(`\nTotal: ${total}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
