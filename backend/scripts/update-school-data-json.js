/**
 * Extracts SCHOOL_DATA from import-students.html and writes it to school_data.json
 * so the frontend data-import.html has the full 686 fee records.
 */
const fs = require('fs');
const path = require('path');

const htmlPath = path.join(
  __dirname, '..', '..', 'SE Project (2)', 'SE Project', 'New folder', 'import-students.html'
);
const html = fs.readFileSync(htmlPath, 'utf8');
const match = html.match(/var SCHOOL_DATA\s*=\s*(\{[\s\S]*?\});\s*\n/);
if (!match) { console.error('❌ SCHOOL_DATA not found'); process.exit(1); }

const data = JSON.parse(match[1]);
const outPath = path.join(__dirname, '..', '..', 'SE Project (2)', 'SE Project', 'New folder', 'school_data.json');
fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
console.log(`✅ school_data.json updated: ${data.students.length} students, ${data.feeRecords.length} fee records`);
