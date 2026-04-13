const fs = require('fs');

const filePath = 'c:/Users/fabia/Desktop/STARFORCE-Dark-Horizon/script/gameLoop.js';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// Find and remove the orphaned separator
// Lines 103-107: separator, blank, blank, blank, PLAYER & SPAWN
const result = [];
let i = 0;
while (i < lines.length) {
  if (i < lines.length - 4 &&
      lines[i].includes('// -----') && !lines[i].includes('PLAYER') &&
      lines[i + 1].trim() === '' &&
      lines[i + 2].trim() === '' &&
      lines[i + 3].trim() === '' &&
      lines[i + 4].includes('PLAYER & SPAWN')) {
    // Skip lines[i] (the orphaned separator)
    // Keep lines[i+1] (one blank), skip lines[i+2] and [i+3] (extra blanks)
    result.push('');
    i += 4;
  } else {
    result.push(lines[i]);
    i++;
  }
}

const newContent = result.join('\n');
fs.writeFileSync(filePath, newContent, 'utf8');
console.log('✓ File cleaned');

// Show the fixed area
const newLines = newContent.split('\n');
console.log('\nFixed area (lines 100-115):');
for (let j = 99; j < 115 && j < newLines.length; j++) {
  console.log(`${String(j + 1).padStart(3)}: ${newLines[j]}`);
}

// Verify no wingman
const wingman = newContent.match(/currentWingman|WINGMAN/g) || [];
console.log(`\n✓ Wingman references: ${wingman.length}`);
