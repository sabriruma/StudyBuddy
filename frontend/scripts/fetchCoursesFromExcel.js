const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");

// Read the Excel file
const workbook = xlsx.readFile(path.join(__dirname, '../src/data/courses.xlsx'));

const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

const courseList = [];

for (let i = 1; i < data.length; i++) {
  const row = data[i];
  const code = `${row[0] || ''}${row[1] || ''}`.trim(); // Columns A & B

  if (code) {
    courseList.push({ code });
  }
}

// Make sure the folder exists
const outputDir = path.join(__dirname, '../src/data');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write the courses to JSON
fs.writeFileSync(
  path.join(outputDir, 'courses.json'),
  JSON.stringify(courseList, null, 2)
);

console.log(`✅ Saved ${courseList.length} courses to courses.json`);
