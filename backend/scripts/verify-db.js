require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

Promise.all([
  p.student.count(),
  p.feeRecord.count(),
  p.class.count(),
  p.section.count(),
  p.user.findFirst({ where: { username: 'admin' }, select: { id: true, username: true, role: true } }),
]).then(function([students, fees, classes, sections, admin]) {
  console.log('Students   :', students);
  console.log('FeeRecords :', fees);
  console.log('Classes    :', classes);
  console.log('Sections   :', sections);
  console.log('Admin      :', JSON.stringify(admin));
}).catch(function(e) {
  console.error('Error:', e.message);
}).finally(function() {
  p.$disconnect();
});
