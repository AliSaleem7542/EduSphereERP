/**
 * INSPECT EXCEL FILE STRUCTURE
 */

const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const excelPath = path.join(__dirname, '..', '..', '2nd-file.xlsx');

if (!fs.existsSync(excelPath)) {
  console.error('File not found:', excelPath);
  process.exit(1);
}

const workbook = XLSX.readFile(excelPath);
console.log('\nSheets in workbook:', workbook.SheetNames);

for (const sheetName of workbook.SheetNames) {
  console.log(`\n${sheetName}:`);
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);
  
  console.log(`  Total rows: ${data.length}`);
  if (data.length > 0) {
    console.log(`  Columns: ${Object.keys(data[0]).join(', ')}`);
    console.log(`\n  First 3 rows:`);
    for (let i = 0; i < Math.min(3, data.length); i++) {
      console.log(`    Row ${i + 1}:`, JSON.stringify(data[i], null, 2));
    }
  }
}

console.log();
