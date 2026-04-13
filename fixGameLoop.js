const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'script', 'gameLoop.js');
let content = fs.readFileSync(filePath, 'utf8');

// The pattern to match the garbage block
// Using a regex that captures the problematic section
const regex = /\/\/ -----+\s+\n\s*\n(\s*\n)+\s*\/\/ -----+\s*\n\s*\/\/ PLAYER & SPAWN\s*\n\s*\/\/ -----+\s*\n\s*\/\/ -----+\s*\n\s*\/\/ WINGMAN \(nave parceira — tecla F\)\s*\n\s*\/\/ -----+/g;

const replacement = `// ---------------------------------------------
    // WINGMAN (nave parceira — tecla F)
    // ---------------------------------------------`;

const newContent = content.replace(regex, replacement);

if (newContent === content) {
    console.log('No match found with regex. Showing lines around 103-115:');
    const lines = content.split('\n');
    for (let i = 100; i < 120; i++) {
        if (lines[i] !== undefined) {
            console.log(`${i+1}: [${lines[i]}]`);
        }
    }
} else {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('File fixed successfully!');
    
    // Show the fixed area
    const lines = newContent.split('\n');
    console.log('\nFixed section (lines 98-120):');
    for (let i = 97; i < 120; i++) {
        if (lines[i] !== undefined) {
            console.log(`${i+1}: ${lines[i]}`);
        }
    }
}
