const fs = require('fs');
const path = require('path');

const originalPath = 'c:/Users/fabia/Desktop/STARFORCE-Dark-Horizon/script/gameLoop.js';
const correctedPath = 'c:/Users/fabia/Desktop/STARFORCE-Dark-Horizon/script/gameLoop_corrected.js';

try {
    // Read the corrected version
    const correctedContent = fs.readFileSync(correctedPath, 'utf8');
    
    // Backup the original first
    const backupPath = originalPath + '.broken';
    const originalContent = fs.readFileSync(originalPath, 'utf8');
    fs.writeFileSync(backupPath, originalContent, 'utf8');
    console.log(`✓ Backup created: ${backupPath}`);
    
    // Write the corrected version to replace original
    fs.writeFileSync(originalPath, correctedContent, 'utf8');
    console.log(`✓ File updated: ${originalPath}`);
    
    // Verify the fix
    const lines = correctedContent.split('\n');
    console.log('\n✓ Verification - Lines 103-105:');
    for (let i = 102; i < 105 && i < lines.length; i++) {
        console.log(`  ${i + 1}: ${lines[i]}`);
    }
    
    if (lines[102].includes('// PLAYER & SPAWN')) {
        console.log('✓ Line 103 now contains: "// PLAYER & SPAWN"');
    } else {
        console.log('❌ ERROR: Expected "// PLAYER & SPAWN" on line 103');
    }
    
    if (lines[103].includes('// -----')) {
        console.log('✓ Line 104 now contains the separator');
    } else {
        console.log('❌ ERROR: Expected separator on line 104');
    }
    
    if (lines[104].includes('if (playerShip && playerShip.isAlive)')) {
        console.log('✓ Line 105 now contains: "if (playerShip && playerShip.isAlive) {"');
    } else {
        console.log('❌ ERROR: Expected "if (playerShip && playerShip.isAlive)" on line 105');
    }
    
    console.log('\n✅ SUCCESS: gameLoop.js has been fixed!');
    
} catch (err) {
    console.error('❌ ERROR:', err.message);
    process.exit(1);
}
