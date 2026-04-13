const fs = require('fs');
const path = require('path');

// Read the corrected file
const correctedPath = path.join(__dirname, 'script', 'gameLoop_corrected.js');
const originalPath = path.join(__dirname, 'script', 'gameLoop.js');

const correctedContent = fs.readFileSync(correctedPath, 'utf8');

// Write to the original file
fs.writeFileSync(originalPath, correctedContent, 'utf8');

console.log('✓ gameLoop.js has been fixed!');
console.log('\nVerifying fix...');

// Verify the fix
const lines = correctedContent.split('\n');
console.log('\nLines 101-106:');
for (let i = 100; i < 106 && i < lines.length; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}
