import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';

const xlsDir = './xls';
const files = fs.readdirSync(xlsDir).filter(f => f.startsWith('01_'));

console.log('Found 01_ files:', files);

files.forEach(file => {
  const filePath = path.join(xlsDir, file);
  console.log(`\n==========================================\nFile: ${file}\n==========================================`);
  const workbook = xlsx.readFile(filePath);
  console.log('Sheets:', workbook.SheetNames);
  
  // Let's print the first sheet's content (or top 35 rows/columns)
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  
  console.log(`First sheet (${sheetName}) - top 60 rows:`);
  data.slice(0, 60).forEach((row, i) => {
    // only print if row has non-empty cells
    if (row.some(c => c !== null && c !== undefined && c !== '')) {
      // join with tab or comma
      console.log(`Row ${i + 1}:`, row.map(c => typeof c === 'string' ? c.trim() : c).filter((c, idx) => c !== '' || idx < 15));
    }
  });
});
