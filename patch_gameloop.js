const fs = require('fs');

// Read the gameLoop.js file
let content = fs.readFileSync('./script/gameLoop.js', 'utf8');
console.log('File read, size:', content.length);

// 1. Add currentWingman to imports
if (content.includes('particles, pickups, BACKGROUND_SPEED_DIVISOR,')) {
    content = content.replace(
        'particles, pickups, BACKGROUND_SPEED_DIVISOR,',
        'particles, pickups, BACKGROUND_SPEED_DIVISOR,\n    currentWingman, setCurrentWingman,'
    );
    console.log('✓ Added currentWingman to imports');
} else {
    console.log('✗ Import string not found');
}

// 2. Insert wingman block before PLAYER & SPAWN section
const wingmanBlock = `    // WINGMAN
    if (currentWingman) {
        if (playerShip && playerShip.isAlive) {
            currentWingman.update(deltaTime, playerShip.x, playerShip.y);
            for (let wi = currentWingman.projectiles.length - 1; wi >= 0; wi--) {
                const wp = currentWingman.projectiles[wi];
                for (let ei = enemies.length - 1; ei >= 0; ei--) {
                    const enemy = enemies[ei];
                    if (checkCollision(wp, enemy)) {
                        enemy.takeDamage(wp.damage, particles);
                        wp.isAlive = false;
                        currentWingman.projectiles.splice(wi, 1);
                        if (enemy.isExploding) spawnStarPickups(enemy);
                        break;
                    }
                }
            }
            if (currentBoss && currentBoss.isAlive) {
                for (let wi = currentWingman.projectiles.length - 1; wi >= 0; wi--) {
                    const wp = currentWingman.projectiles[wi];
                    if (checkCollision(wp, currentBoss)) {
                        currentBoss.takeDamage(wp.damage, particles);
                        wp.isAlive = false;
                        currentWingman.projectiles.splice(wi, 1);
                    }
                }
            }
        }
        if (!currentWingman.isAlive) setCurrentWingman(null);
    }

`;

// Find the position right before "// PLAYER & SPAWN"
const playerMarker = '    // PLAYER & SPAWN';
const insertIdx = content.indexOf(playerMarker);
if (insertIdx !== -1) {
    content = content.substring(0, insertIdx) + wingmanBlock + content.substring(insertIdx);
    console.log('✓ Inserted wingman block');
} else {
    console.log('✗ Marker for player section not found');
}

// 3. Draw wingman after player draw, before particles
if (content.includes('    particles.forEach(p => p.draw(ctx));')) {
    content = content.replace(
        '    particles.forEach(p => p.draw(ctx));',
        '    if (currentWingman) currentWingman.draw(ctx);\n    particles.forEach(p => p.draw(ctx));'
    );
    console.log('✓ Added wingman draw call');
} else {
    console.log('✗ particles.forEach draw not found');
}

// Write the file back
fs.writeFileSync('./script/gameLoop.js', content, 'utf8');
console.log('✓ File written, new size:', content.length);
