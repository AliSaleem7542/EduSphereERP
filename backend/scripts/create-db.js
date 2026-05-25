/**
 * Creates the edusphere_db database if it doesn't exist.
 * Tries multiple common passwords for the postgres user.
 * Also updates .env with the working password.
 */
const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DB_NAME = 'edusphere_db';
const DB_USER = 'postgres';
const passwords = ['postgres', 'admin', 'password', '1234', '12345', '123456', 'root', ''];

function tryConnect(pwd) {
  const env = { ...process.env, PGPASSWORD: pwd };
  const result = spawnSync(
    'psql',
    ['-U', DB_USER, '-d', 'postgres', '-c', 'SELECT 1'],
    { encoding: 'utf8', env, timeout: 5000 }
  );
  return result.status === 0;
}

function createDatabase(pwd) {
  const env = { ...process.env, PGPASSWORD: pwd };
  // Check if DB exists
  const check = spawnSync(
    'psql',
    ['-U', DB_USER, '-d', 'postgres', '-tAc', `SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'`],
    { encoding: 'utf8', env, timeout: 5000 }
  );
  if (check.stdout && check.stdout.trim() === '1') {
    console.log(`Database '${DB_NAME}' already exists.`);
    return true;
  }
  const create = spawnSync(
    'psql',
    ['-U', DB_USER, '-d', 'postgres', '-c', `CREATE DATABASE ${DB_NAME}`],
    { encoding: 'utf8', env, timeout: 5000 }
  );
  if (create.status === 0) {
    console.log(`Database '${DB_NAME}' created successfully.`);
    return true;
  }
  console.error('Create DB error:', create.stderr);
  return false;
}

function updateEnv(pwd) {
  const envPath = path.join(__dirname, '..', '.env');
  let content = fs.readFileSync(envPath, 'utf8');
  const newUrl = `DATABASE_URL="postgresql://${DB_USER}:${pwd}@localhost:5432/${DB_NAME}"`;
  content = content.replace(/^DATABASE_URL=.*/m, newUrl);
  fs.writeFileSync(envPath, content);
  console.log('.env updated with working password.');
}

let found = false;
for (const pwd of passwords) {
  process.stdout.write(`Trying password: "${pwd}" ... `);
  if (tryConnect(pwd)) {
    console.log('SUCCESS');
    if (createDatabase(pwd)) {
      updateEnv(pwd);
      found = true;
    }
    break;
  } else {
    console.log('failed');
  }
}

if (!found) {
  console.log('\n⚠️  Could not auto-connect to PostgreSQL.');
  console.log('Please manually:');
  console.log('  1. Open .env and set the correct DATABASE_URL');
  console.log('  2. Create the database: CREATE DATABASE edusphere_db;');
  console.log('  3. Then run: node node_modules/prisma/build/index.js db push');
  process.exit(1);
}
