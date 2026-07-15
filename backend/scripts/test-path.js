const fs = require('fs');
const path = require('path');

const testPath = 'C:\\Users\\muham\\Downloads\\updated\\EDUSPHERE\\EDUSPHERE\\SE Project\\SE Project (3)\\SE Project (2)\\SE Project\\New folder\\school_data.json';

console.log('Testing path:', testPath);
console.log('Exists?', fs.existsSync(testPath));
console.log('Is file?', fs.statSync(testPath).isFile());

try {
  const data = fs.readFileSync(testPath, 'utf8');
  const parsed = JSON.parse(data);
  console.log('Successfully loaded!');
  console.log('Has students?', parsed.students && parsed.students.length > 0);
  console.log('Number of students:', parsed.students ? parsed.students.length : 0);
} catch (err) {
  console.error('Error:', err.message);
}
