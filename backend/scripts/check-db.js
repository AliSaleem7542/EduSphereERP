const { execSync } = require('child_process');

const passwords = ['postgres', 'admin', 'password', '123456', ''];

let connected = false;
let workingPassword = null;

for (const pwd of passwords) {
  try {
    const env = { ...process.env, PGPASSWORD: pwd };
    execSync('psql -U postgres -c "SELECT 1"', { encoding: 'utf8', env, stdio: 'pipe' });
    connected = true;
    workingPassword = pwd;
    break;
  } catch (e) {
    // try next
  }
}

if (connected) {
  console.log('DB_CONNECTED=true');
  console.log('DB_PASSWORD=' + workingPassword);
} else {
  console.log('DB_CONNECTED=false');
  console.log('DB_PASSWORD=unknown');
}
