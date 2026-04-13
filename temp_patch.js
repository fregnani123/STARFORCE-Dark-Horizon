const fs = require('fs');
const path = require('path');

// Read the file
const filePath = path.join(__dirname, 'script', 'gameLoop.js');
let c = fs.readFileSync(filePath, 'utf8');

console.log('File read, size:', c.length);

// 1. Add currentWingman to imports
const importsBefore = c.substring(0, 500);
if (c.includes('particles, pickups, BACKGROUND_SPEED_DIVISOR,')) {
    c = c.replace(
        'particles, pickups, BACKGROUND_SPEED_DIVISOR,',
        'particles, pickups, BACKGROUND_SPEED_DIVISOR,\n    currentWingman, setCurrentWingman,'
    );
    console.log('✓ Added currentWingman to imports');
} else {
    console.log('✗ Import string not found');
}

// 2. Insert wingman block before PLAYER & SPAWN section
const marker = '    // PLAYER & SPAWN\n    // PLAYER & SPAWN';
const markerAlt = '    // PLAYER & SPAWN';

let found = false;
let insertPoint = c.indexOf(markerAlt);

if (insertPoint !== -1) {
    const wingmanBlock = `    // WINGMAN
    // WINGMAN
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
    
    c = c.substring(0, insertPoint) + wingmanBlock + c.substring(insertPoint);
    console.log('✓ Inserted wingman block');
    found = true;
} else {
    console.log('✗ Marker not found for wingman block');
}

// 3. Draw wingman after player draw, before particles
if (c.includes('    particles.forEach(p => p.draw(ctx));')) {
    c = c.replace(
        '    particles.forEach(p => p.draw(ctx));',
        '    if (currentWingman) currentWingman.draw(ctx);\n    particles.forEach(p => p.draw(ctx));'
    );
    console.log('✓ Added wingman draw call');
} else {
    console.log('✗ particles.forEach not found');
}

// Write the file
fs.writeFileSync(filePath, c, 'utf8');
console.log('✓ File written, new size:', c.length);
