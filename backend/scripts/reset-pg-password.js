/**
 * Resets the postgres user password to 'postgres' using pg_ctl + trust auth temporarily.
 * This modifies pg_hba.conf temporarily, restarts PG, resets password, then restores.
 */
const { spawnSync, execSync } = require('child_process');
const fs = require('fs');

const PG_DATA = 'C:\\Program Files\\PostgreSQL\\18\\data';
const PG_BIN  = 'C:\\Program Files\\PostgreSQL\\18\\bin';
const HBA     = PG_DATA + '\\pg_hba.conf';
const NEW_PWD = 'postgres';

// Read original hba
const original = fs.readFileSync(HBA, 'utf8');

// Replace scram-sha-256 with trust for localhost
const trusted = original.replace(/scram-sha-256/g, 'trust');
fs.writeFileSync(HBA, trusted);
console.log('pg_hba.conf temporarily set to trust auth');

// Reload PostgreSQL config (pg_ctl reload)
const reload = spawnSync(
  PG_BIN + '\\pg_ctl.exe',
  ['reload', '-D', PG_DATA],
  { encoding: 'utf8' }
);
console.log('pg_ctl reload:', reload.stdout || reload.stderr);

// Wait a moment
const wait = spawnSync('node', ['-e', 'setTimeout(()=>{},2000)'], { timeout: 3000 });

// Reset password
const reset = spawnSync(
  PG_BIN + '\\psql.exe',
  ['-U', 'postgres', '-d', 'postgres', '-c', `ALTER USER postgres WITH PASSWORD '${NEW_PWD}'`],
  { encoding: 'utf8', env: { ...process.env, PGPASSWORD: '' } }
);
console.log('Password reset:', reset.stdout || reset.stderr);

// Restore original hba
fs.writeFileSync(HBA, original);
console.log('pg_hba.conf restored to scram-sha-256');

// Reload again
const reload2 = spawnSync(
  PG_BIN + '\\pg_ctl.exe',
  ['reload', '-D', PG_DATA],
  { encoding: 'utf8' }
);
console.log('pg_ctl reload2:', reload2.stdout || reload2.stderr);

console.log('\nDone. postgres password is now: postgres');
