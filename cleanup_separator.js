const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'script', 'gameLoop.js');
let content = fs.readFileSync(filePath, 'utf8');

// Remove orphaned separator + extra blank lines before "// PLAYER & SPAWN"
// Pattern: separator line, then 2+ blank lines, then the section header
content = content.replace(
  /    \/\/ -+\r?\n(\s*\r?\n){2,}\s*(?=    \/\/ PLAYER & SPAWN)/,
  '\n'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('File written successfully.\n');

// Verify no currentWingman or WINGMAN references
const wingmanRefs = (content.match(/currentWingman|WINGMAN/g) || []);
if (wingmanRefs.length === 0) {
  console.log('✓ No currentWingman or WINGMAN references found.\n');
} else {
  console.log(`✗ Found ${wingmanRefs.length} wingman reference(s): ${wingmanRefs.join(', ')}\n`);
}

// Show lines 100-115
const lines = content.split('\n');
console.log('Lines 100-115:');
for (let i = 99; i < 115 && i < lines.length; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}
