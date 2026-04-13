const fs = require('fs');
const path = require('path');

const filePath = 'c:/Users/fabia/Desktop/STARFORCE-Dark-Horizon/script/gameLoop.js';
let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log(`Total lines before: ${lines.length}`);

// Step 1: Remove lines 103-140 (1-indexed, inclusive)
// We need to find and remove these lines
const result = [];
for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1; // 1-based line number
    if (lineNum >= 103 && lineNum <= 140) {
        console.log(`Removing line ${lineNum}: ${lines[i].substring(0, 70)}`);
        continue; // skip this line
    }
    result.push(lines[i]);
}

console.log(`After removing lines 103-140: ${result.length} lines remain`);

// Step 2: Remove the line containing "if (currentWingman) currentWingman.draw(ctx);"
const finalResult = result.filter((line, idx) => {
    if (line.includes('if (currentWingman)') && line.includes('currentWingman.draw(ctx)')) {
        console.log(`Removing line with currentWingman.draw(): "${line}"`);
        return false;
    }
    return true;
});

console.log(`After removing currentWingman.draw line: ${finalResult.length} lines remain`);

// Step 3: Write back to file with proper line endings
fs.writeFileSync(filePath, finalResult.join('\n'), 'utf8');
console.log(`✓ File updated: ${filePath}`);
console.log('SUCCESS: WINGMAN block removed from gameLoop.js');
