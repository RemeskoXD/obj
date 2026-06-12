import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';

const xlsDir = './xls';
const files = fs.readdirSync(xlsDir).filter(f => f.endsWith('.xls') || f.endsWith('.xlsx'));

console.log('All files found:', files);

files.forEach(file => {
  const filePath = path.join(xlsDir, file);
  try {
    const workbook = xlsx.readFile(filePath);
    console.log(`\n==========================================\nFile: ${file}\n==========================================`);
    console.log('Sheets:', workbook.SheetNames);
    
    // Find the first sheet's bottom lines which contain options info
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    
    // Log rows from row 10 to 45 (or whenever they have options)
    // we want to find where option-definitions start. Usually they have words like "vysvětlivky", "ovládání", "barva", "materiál"
    console.log('Options & helper rows in file:');
    let foundOptionStart = false;
    data.forEach((row, i) => {
      if (row.some(c => typeof c === 'string' && (c.toLowerCase().includes('vysvětlivk') || c.toLowerCase().includes('vysvetlivk') || c.toLowerCase().includes('ovládání') || c.toLowerCase().includes('ovladani') || c.toLowerCase().includes('materiál okna') || c.toLowerCase().includes('vzorník')))) {
        foundOptionStart = true;
      }
      if (foundOptionStart || i >= 20) {
        if (row.some(c => c !== null && c !== undefined && c !== '')) {
          console.log(`Row ${i + 1}:`, row.map(c => typeof c === 'string' ? c.trim() : c).filter((c, idx) => c !== '' || idx < 10));
        }
      }
    });
  } catch (err) {
    console.error(`Error reading ${file}:`, err.message);
  }
});
