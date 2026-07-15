/**
 * Check why these students' fee records were not imported
 */

const XLSX = require('xlsx');

const EXCEL_FILE = './2nd file.xlsx';

const workbook = XLSX.readFile(EXCEL_FILE);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false });

console.log('\n🔍 CHECKING MISSING STUDENTS IN EXCEL\n');
console.log('='.repeat(80));

// Row 4 is header
console.log('\n📋 ROW 4 (Header Row):');
console.log(JSON.stringify(rows[3], null, 2));

// Row 133 - MUHAMMAD SAMI (E-2-504)
console.log('\n\n📋 ROW 133 - MUHAMMAD SAMI (E-2-504):');
const row133 = rows[132]; // 0-indexed
console.log('Section:', row133[2]);
console.log('Roll No:', row133[3]);
console.log('Student Name:', row133[4]);
console.log('Father Name:', row133[5]);
console.log('Package:', row133[10]);
console.log('Annual Paid:', row133[11]);
console.log('Annual Remarks:', row133[12]);
console.log('1st Paid:', row133[15]);
console.log('2nd Paid:', row133[19]);
console.log('3rd Paid:', row133[23]);
console.log('4th Paid:', row133[25]);

// Row 188 - MUHAMMAD FAIZAN (C-3-240)  
console.log('\n\n📋 ROW 188 - MUHAMMAD FAIZAN (C-3-240):');
const row188 = rows[187]; // 0-indexed
console.log('Section:', row188[2]);
console.log('Roll No:', row188[3]);
console.log('Student Name:', row188[4]);
console.log('Father Name:', row188[5]);
console.log('Package:', row188[10]);
console.log('Annual Paid:', row188[11]);
console.log('Annual Remarks:', row188[12]);
console.log('1st Paid:', row188[15]);
console.log('2nd Paid:', row188[19]);
console.log('3rd Paid:', row188[23]);
console.log('4th Paid:', row188[25]);

console.log('\n' + '='.repeat(80));

// Check if they have any payments
console.log('\n💡 ANALYSIS:\n');

function hasPayments(row) {
  const annual = row[11];
  const inst1 = row[15];
  const inst2 = row[19];
  const inst3 = row[23];
  const inst4 = row[25];
  
  return (annual && annual.trim() !== '' && annual.trim() !== '-') ||
         (inst1 && inst1.trim() !== '' && inst1.trim() !== '-') ||
         (inst2 && inst2.trim() !== '' && inst2.trim() !== '-') ||
         (inst3 && inst3.trim() !== '' && inst3.trim() !== '-') ||
         (inst4 && inst4.trim() !== '' && inst4.trim() !== '-');
}

console.log('MUHAMMAD SAMI has payments:', hasPayments(row133));
console.log('MUHAMMAD FAIZAN has payments:', hasPayments(row188));

console.log('\n');
