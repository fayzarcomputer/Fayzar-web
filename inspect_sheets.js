const fs = require('fs');
const BanglaConverter = require('./js/bangla-converter-engine.js');
const dump = JSON.parse(fs.readFileSync('data/raw_excel_dump.json', 'utf8'));

for (const [sheetName, rows] of Object.entries(dump)) {
  if (['Result', 'Result (2)', 'Sheet1'].includes(sheetName)) continue;
  const headerRow = rows.find(r => r.row === 4);
  const sampleStudent = rows.find(r => r.row === 5);
  console.log('====================================');
  console.log('Sheet:', sheetName);
  if (headerRow) {
    const cols = Object.keys(headerRow.cells).map(k => `${k}:${headerRow.cells[k].v}`);
    console.log('Headers:', cols.join(' | '));
  }
  if (sampleStudent) {
    const studentCols = Object.keys(sampleStudent.cells).map(k => {
      const val = sampleStudent.cells[k].v;
      return `${k}:${val}`;
    });
    console.log('Sample (Row 5):', studentCols.slice(0, 12).join(' | '));
  }
}
