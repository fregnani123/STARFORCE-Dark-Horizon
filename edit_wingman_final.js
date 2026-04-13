const fs = require('fs');
let content = fs.readFileSync('c:/Users/fabia/Desktop/STARFORCE-Dark-Horizon/script/gameLoop.js', 'utf8');

// --- Edit 1: Replace the empty block between lines 104-110 with the wingman block ---
// The section looks like (with possible \r\n or \n endings):
//     // ---------------------------------------------
//     (blank lines with possible spaces/tabs)
//     // ---------------------------------------------
//     // PLAYER & SPAWN
// We need to replace the two separators + blank lines with the wingman block

const search1 = /( {4}\/\/ -{45,}\r?\n)(?:[ \t]*\r?\n){1,8}( {4}\/\/ -{45,}\r?\n {4}\/\/ PLAYER & SPAWN)/;

const replace1 = `    // ---------------------------------------------
    // WINGMAN (nave parceira — tecla F)
    // ---------------------------------------------
    if (currentWingman) {
        try {
            if (playerShip && playerShip.isAlive) {
                currentWingman.update(deltaTime, playerShip.x, playerShip.y, enemies);

                for (let wi = currentWingman.projectiles.length - 1; wi >= 0; wi--) {
                    const wp = currentWingman.projectiles[wi];
                    if (!wp || !wp.isAlive) { currentWingman.projectiles.splice(wi, 1); continue; }

                    let hit = false;
                    for (let ei = enemies.length - 1; ei >= 0; ei--) {
                        const enemy = enemies[ei];
                        if (!enemy || !enemy.isAlive || enemy.isExploding) continue;
                        if (checkCollision(wp, enemy)) {
                            enemy.takeDamage(wp.damage, particles);
                            wp.isAlive = false;
                            currentWingman.projectiles.splice(wi, 1);
                            if (enemy.isExploding) spawnStarPickups(enemy);
                            hit = true;
                            break;
                        }
                    }
                    if (!hit && wp.isAlive && currentBoss && currentBoss.isAlive) {
                        if (checkCollision(wp, currentBoss)) {
                            currentBoss.takeDamage(wp.damage, particles);
                            wp.isAlive = false;
                            currentWingman.projectiles.splice(wi, 1);
                        }
                    }
                }
            }
            if (!currentWingman.isAlive) setCurrentWingman(null);
        } catch (err) {
            console.error('[Wingman] erro:', err);
            setCurrentWingman(null);
        }
    }

    // ---------------------------------------------
    // PLAYER & SPAWN`;

if (!search1.test(content)) {
    // Try to show context
    const idx = content.indexOf('// PLAYER & SPAWN');
    console.log('FAILED: Edit 1 regex did not match. Context around PLAYER & SPAWN:');
    console.log(JSON.stringify(content.substring(Math.max(0, idx-300), idx+60)));
    process.exit(1);
}
content = content.replace(search1, replace1);

// --- Edit 2: Add wingman draw call after playerShip.draw(ctx); ---
// Find:
//     playerShip.draw(ctx);
// }
//
//     (blank)
//     particles.forEach
// Replace with:
//     playerShip.draw(ctx);
// }
//
//     if (currentWingman) currentWingman.draw(ctx);
//     particles.forEach

const search2 = /([ \t]*playerShip\.draw\(ctx\);\r?\n[ \t]*\}\r?\n\r?\n)([ \t]*\r?\n[ \t]*particles\.forEach)/;
const replace2 = '$1    if (currentWingman) currentWingman.draw(ctx);\n$2';

if (!search2.test(content)) {
    const idx = content.indexOf('playerShip.draw(ctx)');
    console.log('FAILED: Edit 2 regex did not match. Context:');
    console.log(JSON.stringify(content.substring(Math.max(0, idx-10), idx+150)));
    process.exit(1);
}
content = content.replace(search2, replace2);

fs.writeFileSync('c:/Users/fabia/Desktop/STARFORCE-Dark-Horizon/script/gameLoop.js', content, 'utf8');
console.log('SUCCESS');
