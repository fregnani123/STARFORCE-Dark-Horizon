const fs = require('fs');
const filePath = 'c:\\Users\\fabia\\Desktop\\STARFORCE-Dark-Horizon\\script\\gameLoop.js';
const buf = fs.readFileSync(filePath);
const useCRLF = buf.includes(Buffer.from('\r\n'));
const sep = useCRLF ? '\r\n' : '\n';
const content = buf.toString('utf8');
const lines = content.split(sep);

console.log('Lines 99-110 (0-indexed 98-109):');
for (let i = 98; i < 110; i++) {
  console.log(i+1, JSON.stringify(lines[i]));
}

// Lines to remove: 103,104,105,106 (1-indexed) = indices 102,103,104,105 (0-indexed)
// Verify they are: orphaned separator + blank lines
const removed = lines.splice(102, 4);
console.log('Removed lines:', removed.map(l => JSON.stringify(l)));

console.log('Lines 99-110 after fix:');
for (let i = 98; i < 108; i++) {
  console.log(i+1, JSON.stringify(lines[i]));
}

const newContent = lines.join(sep);
fs.writeFileSync(filePath, newContent, 'utf8');
console.log('File written successfully.');
