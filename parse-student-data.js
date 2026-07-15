const fs = require('fs');
const readline = require('readline');

/**
 * Parse tab-separated student data and convert to JSON array
 * Required fields: Roll No, Name, Class, Section, Gender, Father's Name, Phone
 */

async function parseStudentData(inputFile, outputFile) {
  const students = [];
  
  const rl = readline.createInterface({
    input: fs.createReadStream(inputFile),
    crlfDelay: Infinity
  });

  let lineNum = 0;
  let headerMap = {};

  for await (const line of rl) {
    lineNum++;
    
    // Skip empty lines
    if (!line.trim()) continue;
    
    // Parse header row (first line)
    if (lineNum === 1) {
      const headers = line.split('\t').map(h => h.trim());
      
      // Create mapping of column headers to indices
      headerMap = {
        rollNo: headers.findIndex(h => h.toLowerCase().includes('roll')),
        name: headers.findIndex(h => h.toLowerCase().includes('name') && !h.toLowerCase().includes('father')),
        class: headers.findIndex(h => h.toLowerCase().includes('class')),
        section: headers.findIndex(h => h.toLowerCase().includes('section')),
        gender: headers.findIndex(h => h.toLowerCase().includes('gender')),
        fatherName: headers.findIndex(h => h.toLowerCase().includes('father') && h.toLowerCase().includes('name')),
        phone: headers.findIndex(h => h.toLowerCase().includes('phone'))
      };
      
      console.log('📋 Header mapping:', headerMap);
      continue;
    }

    // Parse data rows
    const columns = line.split('\t').map(col => col.trim());
    
    if (columns.length < 2) continue; // Skip invalid rows
    
    try {
      let phone = columns[headerMap.phone] || '';
      
      // Format phone with 0 prefix
      if (phone && phone !== '0') {
        if (!phone.startsWith('0')) {
          phone = '0' + phone;
        }
      } else {
        phone = null; // If empty or just "0"
      }

      const student = {
        rollNo: columns[headerMap.rollNo] || '',
        name: columns[headerMap.name] || '',
        class: columns[headerMap.class] || '1st Year',
        section: columns[headerMap.section] || '',
        gender: (columns[headerMap.gender] || '').toUpperCase(),
        fatherName: columns[headerMap.fatherName] || '',
        phone: phone
      };

      // Only add if has essential data
      if (student.rollNo && student.name && student.section) {
        students.push(student);
        process.stdout.write('.');
      }
    } catch (e) {
      console.error(`\n⚠️  Error parsing line ${lineNum}:`, e.message);
    }
  }

  // Write JSON output
  fs.writeFileSync(outputFile, JSON.stringify(students, null, 2), 'utf-8');
  
  console.log(`\n\n✅ Successfully parsed ${students.length} students`);
  console.log(`📁 Output saved to: ${outputFile}`);
  
  return students;
}

// Usage
const inputFile = process.argv[2] || './student-data.tsv';
const outputFile = process.argv[3] || './students-parsed.json';

if (!fs.existsSync(inputFile)) {
  console.error(`❌ Input file not found: ${inputFile}`);
  console.log('\nUsage: node parse-student-data.js <input.tsv> <output.json>');
  process.exit(1);
}

parseStudentData(inputFile, outputFile)
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
