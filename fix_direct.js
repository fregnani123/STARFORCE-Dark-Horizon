const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'script', 'gameLoop.js');
let content = fs.readFileSync(filePath, 'utf8');

console.log('Before:');
const linesBefore = content.split('\n');
for (let i = 99; i < 110 && i < linesBefore.length; i++) {
  console.log(`${i + 1}: ${linesBefore[i]}`);
}

// Remove orphaned separator + extra blank lines before "// PLAYER & SPAWN"
content = content.replace(
  /    \/\/ -+\r?\n(\s*\r?\n){2,}\s*(?=    \/\/ PLAYER & SPAWN)/,
  '\n'
);

fs.writeFileSync(filePath, content, 'utf8');

console.log('\nAfter:');
const linesAfter = content.split('\n');
for (let i = 99; i < 110 && i < linesAfter.length; i++) {
  console.log(`${i + 1}: ${linesAfter[i]}`);
}
