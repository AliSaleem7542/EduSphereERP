require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

function ensureSSL(url) {
  if (!url) return url;
  if (url.includes('sslmode=') || url.includes('ssl=')) return url;
  if (url.includes('neon.tech') || url.includes('amazonaws.com')) {
    return url + (url.includes('?') ? '&' : '?') + 'sslmode=require';
  }
  return url;
}

const dbUrl = ensureSSL(process.env.DIRECT_URL || process.env.DATABASE_URL);
process.env.DATABASE_URL = dbUrl;
const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

async function main() {
  console.log('\n🔍 Testing Users API\n');
  await prisma.$connect();

  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, role: true, isActive: true, createdAt: true, updatedAt: true },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`✅ Found ${users.length} users\n`);
    
    users.forEach((u, i) => {
      console.log(`${i+1}. ID: ${u.id} | Username: ${u.username} | Email: ${u.email || '-'} | Role: ${u.role} | Active: ${u.isActive}`);
    });

    console.log('\nRaw JSON (first user):');
    console.log(JSON.stringify(users[0], null, 2));

  } catch(e) {
    console.error('❌ Error:', e.message);
  }

  await prisma.$disconnect();
}

main();
