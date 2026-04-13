const fs = require('fs');
const path = require('path');

const originalPath = 'c:/Users/fabia/Desktop/STARFORCE-Dark-Horizon/script/gameLoop.js';
const fixedPath = 'c:/Users/fabia/Desktop/STARFORCE-Dark-Horizon/script/gameLoop_fixed.js';

try {
    // Read the fixed version
    const fixedContent = fs.readFileSync(fixedPath, 'utf8');
    
    // Backup the original
    const backupPath = originalPath + '.bak';
    const originalContent = fs.readFileSync(originalPath, 'utf8');
    fs.writeFileSync(backupPath, originalContent, 'utf8');
    console.log(`✓ Backup created: ${backupPath}`);
    
    // Write the fixed version
    fs.writeFileSync(originalPath, fixedContent, 'utf8');
    console.log(`✓ File updated: ${originalPath}`);
    
    // Count lines
    const originalLines = originalContent.split('\n').length;
    const fixedLines = fixedContent.split('\n').length;
    console.log(`✓ Lines removed: ${originalLines - fixedLines}`);
    
    // Verify the changes
    if (fixedContent.includes('currentWingman')) {
        console.log('❌ ERROR: currentWingman still found in the file!');
    } else {
        console.log('✓ WINGMAN block successfully removed');
    }
    
    if (fixedContent.includes('if (currentWingman) currentWingman.draw(ctx)')) {
        console.log('❌ ERROR: currentWingman.draw line still found!');
    } else {
        console.log('✓ currentWingman.draw line successfully removed');
    }
    
    console.log('\nSUCCESS: Script execution complete');
    
} catch (err) {
    console.error('ERROR:', err.message);
    process.exit(1);
}
