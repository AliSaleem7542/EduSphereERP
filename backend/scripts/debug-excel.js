const XLSX = require('xlsx');

const wb = XLSX.readFile('2nd file.xlsx');
console.log('Sheet Names:', wb.SheetNames);

const sheet = wb.Sheets[wb.SheetNames[0]];
console.log('\nSheet Range:', sheet['!ref']);

console.log('\n=== First 15 rows (raw) ===\n');
for(let r = 0; r <= 14; r++) {
  let row = [];
  for(let c = 0; c <= 10; c++) {
    const addr = XLSX.utils.encode_cell({r,c});
    row.push(sheet[addr] ? sheet[addr].v : '');
  }
  console.log(`Row ${r}:`, row.join(' | '));
}

console.log('\n=== JSON output (first 5 rows) ===\n');
const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' });
console.log('Total rows:', jsonData.length);
console.log('\nFirst row keys:', Object.keys(jsonData[0] || {}));
console.log('\nFirst 3 rows:', JSON.stringify(jsonData.slice(0, 3), null, 2));
