// ======================================================
// FUNÇÕES UTILITÁRIAS (EXPORTADAS)
// ======================================================

/**
 * Verifica colisão AABB (Axis-Aligned Bounding Box) entre dois objetos.
 * NOTA: Esta função já existe no GameObject.js (checkCollision),
 * mas é bom tê-la como uma utilidade separada se necessário.
 */
export function checkCollision(objA, objB) {
    // 
    return (
        objA.x < objB.x + objB.width &&
        objA.x + objA.width > objB.x &&
        objA.y < objB.y + objB.height &&
        objA.y + objA.height > objB.y
    );
}

/**
 * Encontra o inimigo mais próximo para projéteis teleguiados.
 * Usa distância quadrada (distanceSq) para otimizar, evitando a raiz quadrada (Math.sqrt).
 */
export function findNearestEnemy(projectile, enemies) {
    let nearestEnemy = null;
    let minDistanceSq = Infinity;

    const projCenterX = projectile.x + projectile.width / 2;
    const projCenterY = projectile.y + projectile.height / 2;

    for (const enemy of enemies) {
        // Ignora inimigos mortos e aqueles que ainda não entraram na tela
        if (enemy.isAlive && enemy.y > 0) { 
            const enemyCenterX = enemy.x + enemy.width / 2;
            const enemyCenterY = enemy.y + enemy.height / 2;

            const dx = enemyCenterX - projCenterX;
            const dy = enemyCenterY - projCenterY;
            const distanceSq = dx * dx + dy * dy;

            if (distanceSq < minDistanceSq) {
                minDistanceSq = distanceSq;
                nearestEnemy = enemy;
            }
        }
    }
    return nearestEnemy;
}