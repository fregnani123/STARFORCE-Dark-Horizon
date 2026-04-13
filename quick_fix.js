const fs = require('fs');

const targetFile = 'c:/Users/fabia/Desktop/STARFORCE-Dark-Horizon/script/gameLoop.js';
const sourceFix = fs.readFileSync('c:/Users/fabia/Desktop/STARFORCE-Dark-Horizon/script/gameLoop_fixed.js', 'utf8');

// Create backup
const currentContent = fs.readFileSync(targetFile, 'utf8');
fs.writeFileSync(targetFile + '.bak', currentContent);

// Apply fix
fs.writeFileSync(targetFile, sourceFix);

console.log('✓ WINGMAN block removed');
console.log('✓ currentWingman.draw() line removed'); 
console.log('✓ File updated successfully');
