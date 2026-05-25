const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Find PostgreSQL installation directory
const pgPaths = [
  'C:\\Program Files\\PostgreSQL\\18\\data',
  'C:\\Program Files\\PostgreSQL\\17\\data',
  'C:\\Program Files\\PostgreSQL\\16\\data',
  'C:\\Program Files\\PostgreSQL\\15\\data',
  'C:\\Program Files\\PostgreSQL\\14\\data',
];

for (const p of pgPaths) {
  if (fs.existsSync(p)) {
    console.log('PG_DATA_DIR=' + p);
    const hba = path.join(p, 'pg_hba.conf');
    if (fs.existsSync(hba)) {
      const content = fs.readFileSync(hba, 'utf8');
      const lines = content.split('\n').filter(l => !l.startsWith('#') && l.trim());
      console.log('\npg_hba.conf active lines:');
      lines.forEach(l => console.log(' ', l));
    }
    break;
  }
}

// Also try to find via registry or pg_config
const pgConfig = spawnSync('pg_config', ['--bindir'], { encoding: 'utf8' });
if (pgConfig.status === 0) {
  console.log('\npg_config bindir:', pgConfig.stdout.trim());
}
