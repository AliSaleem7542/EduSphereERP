/**
 * Injects <script src="js/config.js"></script> before auth.js in all HTML files.
 * Run once: node scripts/inject-config.js
 */
const fs   = require('fs');
const path = require('path');

const frontendDir = path.join(
  __dirname, '..', '..', 'SE Project (2)', 'SE Project', 'New folder'
);

const files = fs.readdirSync(frontendDir).filter(f => f.endsWith('.html'));
let updated = 0;

files.forEach(file => {
  const fp  = path.join(frontendDir, file);
  let html  = fs.readFileSync(fp, 'utf8');

  // Skip if config.js already injected
  if (html.includes('js/config.js')) return;

  // Inject before the first occurrence of auth.js script tag
  const before = '<script src="js/auth.js">';
  const after  = '<script src="js/config.js"></script>\n    <script src="js/auth.js">';

  if (html.includes(before)) {
    html = html.replace(before, after);
    fs.writeFileSync(fp, html, 'utf8');
    updated++;
    console.log('  ✅ Injected config.js into:', file);
  }
});

// Also handle ./js/auth.js variant
files.forEach(file => {
  const fp  = path.join(frontendDir, file);
  let html  = fs.readFileSync(fp, 'utf8');
  if (html.includes('js/config.js')) return;

  const before = '<script src="./js/auth.js">';
  const after  = '<script src="./js/config.js"></script>\n    <script src="./js/auth.js">';
  if (html.includes(before)) {
    html = html.replace(before, after);
    fs.writeFileSync(fp, html, 'utf8');
    updated++;
    console.log('  ✅ Injected config.js into:', file);
  }
});

console.log(`\nDone. Updated ${updated} files.`);
