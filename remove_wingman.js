const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'script', 'gameLoop.js');

console.log(`Reading file: ${filePath}`);
const content = fs.readFileSync(filePath, 'utf8');

// Pattern: orphaned separator line followed by blank/whitespace lines before PLAYER & SPAWN
// We want to remove the separator line and extra blank lines, keeping just one blank line
const pattern = /(\n\s*}\n)\s*\/\/ -----+\s*\n+(\s*\/\/ PLAYER & SPAWN)/g;
const replacement = '$1\n$2';

const newContent = content.replace(pattern, replacement);

if (newContent !== content) {
  console.log('✓ Found and fixed the orphaned separator pattern');
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log('✓ File updated successfully');
} else {
  console.log('✗ Pattern not found or already fixed');
}

// Verify the fix by checking for any remaining problematic patterns
if (newContent.includes('// ---') && newContent.includes('PLAYER & SPAWN')) {
  const lines = newContent.split('\n');
  for (let i = 0; i < lines.length - 1; i++) {
    if (lines[i].includes('// -----') && lines[i + 1].trim() === '' && 
        i + 2 < lines.length && lines[i + 2].includes('PLAYER & SPAWN')) {
      console.log('⚠ Warning: Pattern may still exist at line ' + (i + 1));
    }
  }
}

console.log('\n--- Verification: Checking for wingman references ---');
const wingmanMatches = newContent.match(/currentWingman|WINGMAN/g) || [];
if (wingmanMatches.length === 0) {
  console.log('✓ No currentWingman or WINGMAN references found');
} else {
  console.log(`✗ Found ${wingmanMatches.length} references to wingman`);
  wingmanMatches.forEach((match, index) => {
    console.log(`  ${index + 1}. ${match}`);
  });
}

console.log('\n--- Showing fixed area (lines 100-115) ---');
const finalLines = newContent.split('\n');
for (let i = Math.max(0, 99); i < Math.min(finalLines.length, 115); i++) {
  console.log(`${String(i + 1).padStart(3, ' ')}: ${finalLines[i]}`);
}
