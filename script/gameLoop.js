// ======================================================
// IMPORTS OBRIGATÓRIOS (ORQUESTRAÇÃO DO JOGO)
// ======================================================
import {
    lastTime, isPaused, MAX_DELTA_TIME_MS,
    CANVAS_WIDTH, CANVAS_HEIGHT, ctx,
    currentMissionId,
    playerShip, enemies, enemyProjectiles, currentBoss, gameBackgrounds,
    score, superLaserCharge, SUPER_LASER_REQUIREMENT,
    enemySpawnTimer, ENEMY_SPAWN_INTERVAL, nextHealthPickupScore,
    particles, pickups, BACKGROUND_SPEED_DIVISOR,
    isOpeningMission,
    openingLandingActive,
    setOpeningLandingActive,
    triggerPostLandingCallback,
    // 🛑 IMPORTAÇÃO DOS SETTERS PARA MODIFICAR O ESTADO GLOBAL 🛑
    setLastTime,
    setEnemySpawnTimer,
    updateScore,
    updateSuperLaserCharge,
    // 🛑 CORREÇÃO CRÍTICA: Adicionar o setter de Health Pickup
    setNextHealthPickupScore,
    currentWingman, setCurrentWingman,
} from './globals.js';

// Importa funções de utilidade e controle
import { checkCollision, findNearestEnemy } from './utils.js';
import { updateSuperLaserButton, updateUpgradeButton } from './btnUpdate.js';
import { spawnRandomEnemy } from './Spawn.js';
import { spawnHealthPickup, spawnStarPickups } from './spawnItem.js';
import { updatePlayerMovement, updateHTMLHUD } from './controle.js';
import { playExplosionSound, playCoinSound } from './audio_game.js';

// Variável local para o deslocamento do background neste frame
let BACKGROUND_SPEED_Y = 0;
// Acumulador para score por movimento
let movementScoreAccumulator = 0;
const openingCompanionImg = new Image();
openingCompanionImg.src = '../assets/img/cenarios/cenario-missao/inicio-game/nave-lua.png';
let openingCompanionX = null;
let openingCompanionY = null;
let openingLandingPhase = 'idle';
let openingLandingElapsed = 0;
let landingPlayerStartX = 0;
let landingPlayerStartY = 0;
let landingCompanionStartX = 0;
let landingCompanionStartY = 0;
let landingPlayerX = 0;
let landingPlayerY = 0;
let landingCompanionX = 0;
let landingCompanionY = 0;
let landingTouchdownShakeMs = 0;
let postLandingCallbackFired = false;

let openingLandingScaleFactor = 1.0;

// Imagens extras para a base da missão de abertura (naves e veículos estacionados)
const openingStaticShipImg = new Image();
openingStaticShipImg.src = '../assets/img/cenarios/cenario-missao/inicio-game/nave-lua.png';
const openingStaticShipMetalImg = new Image();
openingStaticShipMetalImg.src = '../assets/img/nave-player/nave-metal.png';
const openingStaticVehicleImg = new Image();
openingStaticVehicleImg.src = '../assets/img/cenarios/cenario-missao/inicio-game/veiculo-lunar.png';

// Fundo da base lunar (colonia_lunar.png)
const colonyBg = new Image();
colonyBg.src = '../assets/img/cenarios/cenario-missao/inicio-game/colonia_lunar.png';

const OPENING_LANDING_ZONE = {
    leftX: Math.round((CANVAS_WIDTH * 0.5) - 156),
    topY: CANVAS_HEIGHT - 300, // Restaurado para a posição original para não cortar a imagem
    padSize: 96,
    padGap: 120,
};

const OPENING_LANDING_SEQUENCE = {
    accelerateMs: 3400,
    descendMs: 3600,
    brakeMs: 1800,
};

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function getOpeningLandingTargets(playerShipInstance) {
    const playerW = playerShipInstance?.width || 70;
    const playerH = playerShipInstance?.height || 80;

    // Centro horizontal do canvas
    const targetX = (CANVAS_WIDTH / 2) - (playerW / 2);
    // Rodapé do canvas com recuo de 48px (aprox 3 rems)
    const targetY = CANVAS_HEIGHT - playerH - 48;

    return {
        playerX: targetX,
        playerY: targetY,
        companionX: targetX + 110, // Acompanhante pousa logo ao lado
        companionY: targetY + 10,
    };
}

function resetOpeningLandingState() {
    openingLandingPhase = 'idle';
    openingLandingElapsed = 0;
    openingLandingScaleFactor = 1.0;
    landingPlayerX = 0;
    landingPlayerY = 0;
    landingCompanionX = 0;
    landingCompanionY = 0;
    landingTouchdownShakeMs = 0;
    postLandingCallbackFired = false;
}

// ── Helpers de desenho da base lunar ──────────────────────────────────
function _baseRoundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function _drawSolarPanel(x, y, w, h) {
    ctx.fillStyle = '#0b4376';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = 'rgba(100, 160, 220, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, w, h);
    ctx.strokeStyle = 'rgba(140, 200, 255, 0.25)';
    ctx.lineWidth = 0.7;
    for (let gy = 0; gy < h; gy += 16) {
        ctx.beginPath(); ctx.moveTo(x, y + gy); ctx.lineTo(x + w, y + gy); ctx.stroke();
    }
    for (let gx = 0; gx < w; gx += 18) {
        ctx.beginPath(); ctx.moveTo(x + gx, y); ctx.lineTo(x + gx, y + h); ctx.stroke();
    }
    ctx.fillStyle = 'rgba(160, 220, 255, 0.10)';
    ctx.fillRect(x + 2, y + 2, w / 3, h - 4);
}

function _drawSmallModule(x, y, w, h) {
    ctx.fillStyle = '#d4dce8';
    _baseRoundRect(x, y, w, h, 4); ctx.fill();
    ctx.strokeStyle = 'rgba(140, 160, 185, 0.65)';
    ctx.lineWidth = 1;
    _baseRoundRect(x, y, w, h, 4); ctx.stroke();
    ctx.fillStyle = 'rgba(70, 110, 155, 0.25)';
    ctx.fillRect(x + 6, y + 8, w - 12, 7);
}

function _drawReactorDome(cx, cy, radius) {
    ctx.fillStyle = '#e0e6ef';
    ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(150, 175, 205, 0.75)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(100, 140, 180, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, radius * 0.6, 0, Math.PI * 2); ctx.stroke();
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 0.45);
    glow.addColorStop(0, 'rgba(110, 200, 255, 0.35)');
    glow.addColorStop(1, 'rgba(110, 200, 255, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(cx, cy, radius * 0.45, 0, Math.PI * 2); ctx.fill();
}

function _drawHangarBay(x, y, w, h) {
    ctx.fillStyle = '#d8e0ec';
    _baseRoundRect(x, y, w, h, 5); ctx.fill();
    ctx.strokeStyle = 'rgba(140, 165, 195, 0.65)';
    ctx.lineWidth = 1;
    _baseRoundRect(x, y, w, h, 5); ctx.stroke();
    ctx.fillStyle = 'rgba(35, 65, 95, 0.32)';
    ctx.fillRect(x + 10, y + h - 24, w - 20, 18);
    ctx.strokeStyle = 'rgba(75, 105, 140, 0.45)';
    ctx.strokeRect(x + 10, y + h - 24, w - 20, 18);
}

// Domo de vidro principal (vista de cima)
function _drawGlassDome(cx, cy, rx, ry) {
    ctx.save();
    const grad = ctx.createRadialGradient(
        cx - rx * 0.25,
        cy - ry * 0.35,
        0,
        cx,
        cy,
        rx
    );
    grad.addColorStop(0, 'rgba(220, 245, 255, 0.95)');
    grad.addColorStop(0.45, 'rgba(170, 210, 240, 0.75)');
    grad.addColorStop(1, 'rgba(90, 140, 190, 0.25)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    // aro de base do domo
    ctx.strokeStyle = 'rgba(150, 175, 205, 0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();

    // brilho superior
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.ellipse(cx - rx * 0.15, cy - ry * 0.4, rx * 0.65, ry * 0.4, -0.2, 0, Math.PI);
    ctx.stroke();

    ctx.restore();
}

// Estufas alongadas com vidro
function _drawGreenhouse(x, y, w, h) {
    ctx.save();

    // estrutura externa
    ctx.fillStyle = '#e6ecf4';
    _baseRoundRect(x, y, w, h, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(150, 175, 205, 0.9)';
    ctx.lineWidth = 1.5;
    _baseRoundRect(x, y, w, h, 8);
    ctx.stroke();

    // vidro interno esverdeado
    const innerX = x + 8;
    const innerY = y + 6;
    const innerW = w - 16;
    const innerH = h - 14;
    const glassGrad = ctx.createLinearGradient(innerX, innerY, innerX, innerY + innerH);
    glassGrad.addColorStop(0, 'rgba(210, 245, 230, 0.85)');
    glassGrad.addColorStop(0.5, 'rgba(150, 215, 190, 0.8)');
    glassGrad.addColorStop(1, 'rgba(110, 180, 150, 0.85)');
    ctx.fillStyle = glassGrad;
    ctx.fillRect(innerX, innerY, innerW, innerH);

    // divisões internas (arcos metálicos)
    ctx.strokeStyle = 'rgba(110, 150, 150, 0.7)';
    ctx.lineWidth = 1;
    const sections = 4;
    for (let i = 1; i < sections; i++) {
        const t = i / sections;
        const sx = innerX + t * innerW;
        ctx.beginPath();
        ctx.moveTo(sx, innerY);
        ctx.lineTo(sx, innerY + innerH);
        ctx.stroke();
    }

    // linha horizontal de reforço
    ctx.beginPath();
    ctx.moveTo(innerX, innerY + innerH * 0.55);
    ctx.lineTo(innerX + innerW, innerY + innerH * 0.55);
    ctx.stroke();

    ctx.restore();
}

// Módulo de alojamento
function _drawHabModule(x, y, w, h) {
    ctx.save();

    ctx.fillStyle = '#e4e8f0';
    _baseRoundRect(x, y, w, h, 6);
    ctx.fill();
    ctx.strokeStyle = 'rgba(150, 170, 195, 0.95)';
    ctx.lineWidth = 1.5;
    _baseRoundRect(x, y, w, h, 6);
    ctx.stroke();

    // faixa de janelas
    const wx = x + 8;
    const wy = y + 10;
    const ww = w - 16;
    const wh = h - 18;
    const winGrad = ctx.createLinearGradient(wx, wy, wx, wy + wh);
    winGrad.addColorStop(0, 'rgba(50, 80, 115, 0.8)');
    winGrad.addColorStop(1, 'rgba(30, 50, 80, 0.95)');
    ctx.fillStyle = winGrad;
    ctx.fillRect(wx, wy, ww, wh);

    ctx.restore();
}

// Naves / veículos estacionados sobre plataformas
function _drawParkedAsset(img, cx, cy, w, h, opacity = 1) {
    if (!img || !img.complete) return;
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.imageSmoothingEnabled = false;
    const x = Math.round(cx - w / 2);
    const y = Math.round(cy - h / 2);
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();
}

// Nave 2 com manobra (rolagem) e fogo traseiro
function _drawOpeningCompanion(x, y, w, h, roll) {
    if (!openingCompanionImg.complete || openingCompanionImg.naturalWidth === 0) return;

    const cx = x + w / 2;
    const cy = y + h / 2;

    ctx.save();
    ctx.translate(cx, cy);

    // Roll para simular asas: uma sobe, outra desce
    ctx.rotate(roll);
    const skew = Math.sin(roll) * 0.25;
    ctx.transform(1, 0, skew, 1, 0, 0);

    // Fogo traseiro
    const flameLen = 24 + Math.abs(Math.sin(performance.now() * 0.02)) * 7;
    const flameW = 10 + Math.abs(Math.cos(performance.now() * 0.02)) * 4;
    const flameGrad = ctx.createLinearGradient(0, h / 2 - 6, 0, h / 2 - 6 + flameLen);
    flameGrad.addColorStop(0, 'rgba(255, 180, 60, 0.95)');
    flameGrad.addColorStop(0.5, 'rgba(255, 120, 30, 0.7)');
    flameGrad.addColorStop(1, 'rgba(255, 120, 30, 0)');
    ctx.fillStyle = flameGrad;
    ctx.globalAlpha = 0.9;
    ctx.fillRect(-flameW / 2, h / 2 - 2, flameW, flameLen);
    ctx.globalAlpha = 1;

    // Desenho da nave
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(openingCompanionImg, Math.floor(-w / 2), Math.floor(-h / 2), w, h);
    ctx.restore();
}

function _drawWhitePad(padX, padY, size, label, now, lineAlpha) {
    const inner = 16;
    const cx = padX + size / 2;
    const cy = padY + size / 2;

    // Base metálica clara
    const padGrad = ctx.createLinearGradient(padX, padY, padX, padY + size);
    padGrad.addColorStop(0, '#e5e9f2');
    padGrad.addColorStop(0.4, '#d1d7e4');
    padGrad.addColorStop(1, '#b8c1d3');
    ctx.fillStyle = padGrad;
    ctx.fillRect(padX, padY, size, size);

    // textura de metal escovado
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
        const y = padY + 12 + i * 18;
        ctx.beginPath();
        ctx.moveTo(padX + 8, y);
        ctx.lineTo(padX + size - 8, y);
        ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(110, 130, 160, 0.95)';
    ctx.lineWidth = 3;
    ctx.strokeRect(padX, padY, size, size);

    ctx.strokeStyle = `rgba(255, 210, 120, ${Math.max(0.4, lineAlpha)})`;
    ctx.lineWidth = 2.4;
    ctx.strokeRect(padX + inner, padY + inner, size - inner * 2, size - inner * 2);

    ctx.strokeStyle = 'rgba(60, 90, 130, 0.7)';
    ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(cx, padY + 22); ctx.lineTo(cx, padY + size - 22); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 20, cy); ctx.lineTo(cx + 20, cy); ctx.stroke();

    const corners = [[padX + 7, padY + 7], [padX + size - 7, padY + 7], [padX + 7, padY + size - 7], [padX + size - 7, padY + size - 7]];
    corners.forEach(([px, py], i) => {
        const b = 0.3 + Math.max(0, Math.sin((now * 0.012) + i) * 0.5);
        ctx.fillStyle = `rgba(120, 230, 255, ${b})`;
        ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fill();
    });

    ctx.fillStyle = 'rgba(255, 220, 120, 0.35)';
    ctx.fillRect(padX + 10, padY + 5, size - 20, 5);

    ctx.fillStyle = `rgba(215, 240, 255, ${Math.max(0.6, lineAlpha + 0.12)})`;
    ctx.font = '600 13px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, cx, padY - 10);
}

// ── Função principal da base de pouso ────────────────────────────────
function drawOpeningLandingZone() {
    const now = performance.now();
    const pulse = 0.6 + Math.sin(now * 0.005) * 0.2;

    const LZ = OPENING_LANDING_ZONE;

    ctx.save();

    // ─────────────────────────────────────────────
    // 1 ▸ BACKGROUND (IMAGEM FULL AREA)
    // ─────────────────────────────────────────────
    if (colonyBg.complete) {
        ctx.drawImage(
            colonyBg,
            LZ.leftX - 200,
            LZ.topY - 300,
            (LZ.padSize * 2 + LZ.padGap) + 400,
            LZ.padSize + 500
        );
    }

    // ─────────────────────────────────────────────
    // 2 ▸ OVERLAY PRA DAR ESTILO (OPCIONAL)
    // ─────────────────────────────────────────────
    const grad = ctx.createLinearGradient(0, LZ.topY - 200, 0, LZ.topY + 300);
    // grad.addColorStop(0, 'rgba(10,15,30,0.4)');
    // grad.addColorStop(1, 'rgba(10,15,30,0.7)');

    ctx.fillStyle = grad;
    ctx.fillRect(
        LZ.leftX - 200,
        LZ.topY - 300,
        (LZ.padSize * 2 + LZ.padGap) + 400,
        LZ.padSize + 500
    );

    // ─────────────────────────────────────────────
    // 3 ▸ PADS (AGORA SÃO O FOCO)
    // ─────────────────────────────────────────────
    const secondPadX = LZ.leftX + LZ.padSize + LZ.padGap;

    // _drawWhitePad(LZ.leftX, LZ.topY, LZ.padSize, 'LANDING A1', now, pulse);
    // _drawWhitePad(secondPadX, LZ.topY, LZ.padSize, 'LANDING A2', now, pulse);

    // glow leve
    function drawGlow(x, y, size) {
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 1.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(120,200,255,${pulse * 0.15})`;
        ctx.fill();
    }

    drawGlow(LZ.leftX, LZ.topY, LZ.padSize);
    drawGlow(secondPadX, LZ.topY, LZ.padSize);



    ctx.restore();
}

function updateOpeningLandingAutopilot(deltaTime, playerShipInstance) {
    const targets = getOpeningLandingTargets(playerShipInstance);

    // 🛑 Zera os inputs de movimento para nivelar as asas e impedir controle manual
    playerShipInstance.dx = 0;
    playerShipInstance.dy = 0;

    if (openingLandingPhase === 'idle') {
        openingLandingPhase = 'accelerate';
        openingLandingElapsed = 0;

        landingPlayerStartX = playerShipInstance.x;
        landingPlayerStartY = playerShipInstance.y;
        landingCompanionStartX = openingCompanionX ?? (playerShipInstance.x + playerShipInstance.width + 32);
        landingCompanionStartY = openingCompanionY ?? (playerShipInstance.y + 18);

        landingPlayerX = landingPlayerStartX;
        landingPlayerY = landingPlayerStartY;
        landingCompanionX = landingCompanionStartX;
        landingCompanionY = landingCompanionStartY;
        openingLandingScaleFactor = 1.0;
    }

    if (openingLandingPhase === 'accelerate') {
        openingLandingElapsed += deltaTime;
        const t = Math.min(1, openingLandingElapsed / OPENING_LANDING_SEQUENCE.accelerateMs);
        const eased = t * t;
        const accelPlayerY = targets.playerY - 170;
        const accelCompanionY = targets.companionY - 170;

        landingPlayerX = lerp(landingPlayerStartX, targets.playerX, eased * 0.7);
        landingPlayerY = lerp(landingPlayerStartY, accelPlayerY, eased);
        landingCompanionX = lerp(landingCompanionStartX, targets.companionX, eased * 0.7);
        landingCompanionY = lerp(landingCompanionStartY, accelCompanionY, eased);

        if (t >= 1) {
            openingLandingPhase = 'descend';
            openingLandingElapsed = 0;
            landingPlayerStartX = landingPlayerX;
            landingPlayerStartY = landingPlayerY;
            landingCompanionStartX = landingCompanionX;
            landingCompanionStartY = landingCompanionY;
        }
    } else if (openingLandingPhase === 'descend') {
        openingLandingElapsed += deltaTime;
        const t = Math.min(1, openingLandingElapsed / OPENING_LANDING_SEQUENCE.descendMs);
        const eased = 1 - Math.pow(1 - t, 3);
        openingLandingScaleFactor = lerp(1.0, 0.6, eased); // Diminui a escala de 1.0 para 0.6 durante a descida

        landingPlayerX = lerp(landingPlayerStartX, targets.playerX, eased);
        landingPlayerY = lerp(landingPlayerStartY, targets.playerY, eased);
        landingCompanionX = lerp(landingCompanionStartX, targets.companionX, eased);
        landingCompanionY = lerp(landingCompanionStartY, targets.companionY, eased);

        if (t >= 1) {
            openingLandingPhase = 'brake';
            openingLandingElapsed = 0;
            landingPlayerStartX = landingPlayerX;
            landingPlayerStartY = landingPlayerY;
            landingCompanionStartX = landingCompanionX;
            landingCompanionStartY = landingCompanionY;
        }
    } else if (openingLandingPhase === 'brake') {
        openingLandingElapsed += deltaTime;
        const t = Math.min(1, openingLandingElapsed / OPENING_LANDING_SEQUENCE.brakeMs);
        const eased = 1 - Math.pow(1 - t, 2);
        const brakePlayerY = targets.playerY + 8;
        const brakeCompanionY = targets.companionY + 8;
        openingLandingScaleFactor = 0.6;

        landingPlayerX = lerp(landingPlayerStartX, targets.playerX, eased);
        landingPlayerY = lerp(landingPlayerStartY, brakePlayerY, eased);
        landingCompanionX = lerp(landingCompanionStartX, targets.companionX, eased);
        landingCompanionY = lerp(landingCompanionStartY, brakeCompanionY, eased);

        if (t >= 1) {
            openingLandingPhase = 'landed';
            landingTouchdownShakeMs = 700;
        }
    }

    if (openingLandingPhase === 'landed') {
        landingPlayerX = targets.playerX;
        landingPlayerY = targets.playerY;
        landingCompanionX = targets.companionX;
        landingCompanionY = targets.companionY;
        openingLandingScaleFactor = 0.6;

        if (landingTouchdownShakeMs > 0) {
            landingTouchdownShakeMs = Math.max(0, landingTouchdownShakeMs - deltaTime);
            const decay = landingTouchdownShakeMs / 700;
            const jitter = Math.sin(performance.now() * 0.06) * (2.6 * decay);
            landingPlayerY += jitter;
            landingCompanionY -= jitter * 0.8;
        } else if (!postLandingCallbackFired) {
            postLandingCallbackFired = true;
            triggerPostLandingCallback();
        }
    }

    playerShipInstance.x = landingPlayerX;
    playerShipInstance.y = landingPlayerY;
    openingCompanionX = landingCompanionX;
    openingCompanionY = landingCompanionY;
}
// --------------------------------------------------------------------------------------------------

/**
 * Função principal do Game Loop.
 * @param {DOMHighResTimeStamp} timestamp - Tempo atual fornecido pelo requestAnimationFrame.
 */
export function gameLoop(timestamp) {

    // --- 1. CÁLCULO DO DELTA TIME E PAUSA ---
    let deltaTime = timestamp - lastTime;

    // 🛑 Limpa o canvas mantendo transparência
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.restore();

    setLastTime(timestamp);

    if (isPaused) {
        requestAnimationFrame(gameLoop);
        return;
    }

    if (!isOpeningMission) {
        openingCompanionX = null;
        openingCompanionY = null;
        resetOpeningLandingState();
    }

    if (deltaTime > MAX_DELTA_TIME_MS) {
        deltaTime = MAX_DELTA_TIME_MS;
    }

    updateSuperLaserButton();

    // ---------------------------------------------
    // BACKGROUND & CÁLCULO DE SCROLL SPEED
    // ---------------------------------------------
    // ---------------------------------------------
    // BACKGROUND & LIMPEZA DE TELA

    BACKGROUND_SPEED_Y = 0;

    // 🛑 CORREÇÃO DEFINITIVA DO RASTRO (FLASH) 🛑
    // Em vez de clearRect, usamos fillRect preto para atropelar qualquer rastro de movimento.
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (gameBackgrounds && gameBackgrounds.length > 0) {
        // ... restante do código do background ...
        const mainBg = gameBackgrounds[0];
        const lockBackgroundScroll = isOpeningMission && openingLandingActive;

        if (!lockBackgroundScroll && mainBg.isScrolling && mainBg.speed && BACKGROUND_SPEED_DIVISOR) {
            BACKGROUND_SPEED_Y = (mainBg.speed * deltaTime) / BACKGROUND_SPEED_DIVISOR;
        }

        for (const bg of gameBackgrounds) {
            if (!lockBackgroundScroll) {
                bg.update(deltaTime);
            }
            bg.draw(ctx);
        }
    } else {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    // ---------------------------------------------
    // BOSS
    // ---------------------------------------------
    if (currentBoss && currentBoss.isAlive) {
        currentBoss.update(deltaTime, BACKGROUND_SPEED_Y);
        currentBoss.fire(enemyProjectiles);
        currentBoss.draw(ctx);
    }

    // ---------------------------------------------





    // ---------------------------------------------
    // PLAYER & SPAWN
    // ---------------------------------------------
    // ---------------------------------------------
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
    // PLAYER & SPAWN--------------------------------------
    if (playerShip && playerShip.isAlive) {

        if (isOpeningMission && openingLandingActive) {
            // 🛑 Limpa as estrelas remanescentes para silenciar o ambiente e o visual durante o pouso
            if (pickups.length > 0) pickups.length = 0;
            drawOpeningLandingZone();
        }

        // Spawn inimigos e pickups
        // 🌟 Permitir spawn durante a intro APENAS na Missão 0
        if ((!isOpeningMission || currentMissionId === 0) && (currentMissionId === 0 || !playerShip.inIntro) && !playerShip.superLaserActive && !openingLandingActive) {

            // Usa Setter para manipular enemySpawnTimer
            setEnemySpawnTimer(enemySpawnTimer + deltaTime);

            if (enemySpawnTimer >= ENEMY_SPAWN_INTERVAL) {
                spawnRandomEnemy(playerShip);
                // Usa Setter para subtrair do timer
                setEnemySpawnTimer(enemySpawnTimer - ENEMY_SPAWN_INTERVAL);
            }

            // Lógica de spawn de vida
            if (score >= nextHealthPickupScore && playerShip.health < playerShip.maxHealth) {
                spawnHealthPickup();
                // 🛑 CORREÇÃO FINAL: Usa Setter para nextHealthPickupScore (Linha 110)
                setNextHealthPickupScore(nextHealthPickupScore + 50);
            }
        }

        // Movimento player
        if (!openingLandingActive) {
            updatePlayerMovement();
        }
        playerShip.update(deltaTime);
        if (isOpeningMission && openingLandingActive) {
            updateOpeningLandingAutopilot(deltaTime, playerShip);
        }
        if (!isOpeningMission) {
            const newProjectiles = playerShip.fire();
            playerShip.projectiles.push(...newProjectiles);
        }

        // --- PROJÉTEIS DO PLAYER ---
        for (let i = playerShip.projectiles.length - 1; i >= 0; i--) {
            const projectile = playerShip.projectiles[i];
            projectile.update(deltaTime);
            if (!projectile.isAlive || projectile.y + projectile.height < 0) {
                playerShip.projectiles.splice(i, 1);
            }
        }

        // Guiamento 
        for (const projectile of playerShip.projectiles) {
            if (projectile.isGuided) {
                if (!projectile.target || !projectile.target.isAlive) {
                    projectile.target = findNearestEnemy(projectile, enemies);
                }
            }
        }

        // --- COLISÃO PLAYER PROJÉTEIS → BOSS ---
        if (currentBoss && currentBoss.isAlive) {
            for (let j = playerShip.projectiles.length - 1; j >= 0; j--) {
                const projectile = playerShip.projectiles[j];
                if (checkCollision(projectile, currentBoss)) {
                    currentBoss.takeDamage(projectile.damage, particles);
                    projectile.isAlive = false;
                    playerShip.projectiles.splice(j, 1);
                }
            }
        }

        // --- 🟢 INIMIGOS: LÓGICA E ATUALIZAÇÃO ---
        if (!isOpeningMission) {
            for (let i = enemies.length - 1; i >= 0; i--) {
                const enemy = enemies[i];
                enemy.update(deltaTime, enemyProjectiles, BACKGROUND_SPEED_Y);

                // Lógica de pontuação e superLaserCharge ao destruir inimigo
                if (enemy.isExploding && enemy.isScored) {
                    updateScore(enemy.scoreValue);
                    const newCharge = Math.min(superLaserCharge + enemy.scoreValue, SUPER_LASER_REQUIREMENT);
                    updateSuperLaserCharge(newCharge);
                    enemy.isScored = false;
                }

                // Colisão: Projéteis do Player -> Inimigo
                for (let j = playerShip.projectiles.length - 1; j >= 0; j--) {
                    const proj = playerShip.projectiles[j];
                    if (checkCollision(proj, enemy)) {
                        enemy.takeDamage(proj.damage, particles);
                        proj.isAlive = false;
                        playerShip.projectiles.splice(j, 1);
                        if (enemy.isExploding) {
                            spawnStarPickups(enemy);
                            break;
                        }
                    }
                }

                // Remoção definitiva de inimigos mortos ou fora da tela
                if (!enemy.isAlive) {
                    enemies.splice(i, 1);
                    playExplosionSound();
                }

                  if ( enemy.y > CANVAS_HEIGHT + enemy.height) {
                    enemies.splice(i, 1);
                    
                }
            }

            // --- 🔵 INIMIGOS: RENDERIZAÇÃO ORDENADA ---
            // (Walkers Priority 0 primeiro, Aviões Priority 1 depois)
            const sortedEnemies = [...enemies].sort((a, b) => (a.renderPriority || 0) - (b.renderPriority || 0));
            sortedEnemies.forEach(enemy => enemy.draw(ctx));
        }

        // --- PARTÍCULAS ---
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            if (!particles[i].isAlive) particles.splice(i, 1);
        }

        // --- PICKUPS (Colisão com Player) ---
        if ((!isOpeningMission || currentMissionId === 0) && !openingLandingActive) {
            for (let i = pickups.length - 1; i >= 0; i--) {
                const pickup = pickups[i];

                pickup.update(deltaTime, playerShip, BACKGROUND_SPEED_Y);
                if (checkCollision(playerShip, pickup)) {
                    pickup.applyEffect(playerShip);
                    playCoinSound();
                    pickups.splice(i, 1);
                    continue;
                }

                if (!pickup.isAlive || pickup.y > CANVAS_HEIGHT + 50) {
                    pickups.splice(i, 1);
                    continue;
                }

                pickup.draw(ctx);
            }
        }

        // --- SUPER LASER (Dano Ao Inimigo) ---
        if (!isOpeningMission && playerShip.superLaserActive) {
            for (let i = enemies.length - 1; i >= 0; i--) {
                const enemy = enemies[i];

                if (enemy.isAlive) {
                    enemy.takeDamage(playerShip.superLaserDamage, particles);

                    // Lógica de pontuação/carga (Repetida, mas necessária para dano do laser)
                    if (enemy.isExploding && enemy.isScored) {
                        updateScore(enemy.scoreValue);

                        const newCharge = Math.min(
                            superLaserCharge + enemy.scoreValue,
                            SUPER_LASER_REQUIREMENT
                        );
                        updateSuperLaserCharge(newCharge);

                        enemy.isScored = false;
                    }
                }
            }
            // Limpa projéteis inimigos quando o laser está ativo (Mutação direta do Array Const)
            enemyProjectiles.length = 0;
        }

        // --- PROJÉTEIS INIMIGOS (Colisão com Player) ---
        if (!isOpeningMission && !playerShip.superLaserActive) {
            for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
                const projectile = enemyProjectiles[i];
                projectile.update(deltaTime);

                if (checkCollision(projectile, playerShip)) {
                    playerShip.takeDamage(projectile.damage);
                    projectile.isAlive = false;
                    enemyProjectiles.splice(i, 1);
                } else if (!projectile.isAlive || projectile.y > CANVAS_HEIGHT) {
                    enemyProjectiles.splice(i, 1);
                } else {
                    projectile.draw(ctx);
                }
            }
        }
    }

    // ---------------------------------------------
    // DESENHO FINAL
    // ---------------------------------------------
    if (playerShip) {
        playerShip.projectiles.forEach(p => p.draw(ctx));

        // Durante a missão de abertura, a nave fica menor ao pousar.
        playerShip.openingLandingScale = (isOpeningMission && openingLandingActive) ? openingLandingScaleFactor : 1;
        playerShip.draw(ctx);

        // Nave 2 removida da missão zero
    }


    if (currentWingman) currentWingman.draw(ctx);
    particles.forEach(p => p.draw(ctx));

    updateHTMLHUD();
    updateUpgradeButton();

    // Chama o próximo frame (recursividade do Game Loop)
    requestAnimationFrame(gameLoop);
}