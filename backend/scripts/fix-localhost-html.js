/**
 * Replaces hardcoded localhost:5000 photo URLs in HTML files
 * with a dynamic expression using window.EDUSPHERE_API_URL
 * Run: node scripts/fix-localhost-html.js
 */
const fs   = require('fs');
const path = require('path');

const frontendDir = path.join(
  __dirname, '..', '..', 'SE Project (2)', 'SE Project', 'New folder'
);

const RENDER_URL = 'https://edusphereerp-scbr.onrender.com';

// Pattern: 'http://localhost:5000' + s.photo  →  (window.EDUSPHERE_API_URL||'https://edusphereerp-scbr.onrender.com') + s.photo
const replacements = [
  // JS string concatenation patterns
  {
    from: /'http:\/\/localhost:5000'\s*\+/g,
    to:   `(window.EDUSPHERE_API_URL||'${RENDER_URL}') +`,
  },
  {
    from: /"http:\/\/localhost:5000"\s*\+/g,
    to:   `(window.EDUSPHERE_API_URL||'${RENDER_URL}') +`,
  },
  // Template literal patterns
  {
    from: /`http:\/\/localhost:5000\$\{/g,
    to:   '`${window.EDUSPHERE_API_URL||\''+RENDER_URL+'\'}${',
  },
  // Direct string in src attributes (rare)
  {
    from: /src="http:\/\/localhost:5000/g,
    to:   `src="${RENDER_URL}`,
  },
];

const files = fs.readdirSync(frontendDir).filter(f => f.endsWith('.html'));
let totalFixed = 0;

files.forEach(file => {
  const fp  = path.join(frontendDir, file);
  let html  = fs.readFileSync(fp, 'utf8');
  let changed = false;

  replacements.forEach(({ from, to }) => {
    if (from.test(html)) {
      from.lastIndex = 0; // reset regex
      html = html.replace(from, to);
      changed = true;
    }
    from.lastIndex = 0;
  });

  if (changed) {
    fs.writeFileSync(fp, html, 'utf8');
    totalFixed++;
    console.log('  ✅ Fixed:', file);
  }
});

console.log(`\nDone. Fixed ${totalFixed} HTML files.`);
