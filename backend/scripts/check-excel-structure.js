const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, '../../2nd-file.xlsx');

if (!fs.existsSync(filePath)) {
  console.error('File not found:', filePath);
  process.exit(1);
}

console.log('\n📖 Checking Excel Structure\n');

const workbook = XLSX.readFile(filePath);
console.log('Sheet names:', workbook.SheetNames);

const sheet = workbook.Sheets[workbook.SheetNames[0]];
console.log('\nFirst sheet:', workbook.SheetNames[0]);

// Get raw data
const data = XLSX.utils.sheet_to_json(sheet);

console.log(`\nTotal rows: ${data.length}`);
console.log('\nColumn names (from first row):');
if (data.length > 0) {
  console.log(Object.keys(data[0]));
  console.log('\nFirst 3 rows:');
  data.slice(0, 3).forEach((row, i) => {
    console.log(`\nRow ${i+1}:`);
    console.log(JSON.stringify(row, null, 2));
  });
}
