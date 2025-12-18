// ======================================================
// IMPORTS OBRIGATÓRIOS
// ======================================================
import { Boss } from './Boss.js'; // Importa a classe Boss
import { 
    CANVAS_WIDTH,
    bossDefeated,   
    currentBoss,    
    // 🛑 CORREÇÃO 1: Adicionar o setter setBossDefeated e corrigir o caminho de import
    setCurrentBoss,
    setBossDefeated
} from './globals.js'; // 🛑 CORREÇÃO 2: Caminho correto para globals.js


/**
 * Função para criar a instância do Boss e mostrar a barra de vida.
 */
export function spawnBoss() {
    // 1. Verifica estado
    if (bossDefeated) return; 
    if (currentBoss && currentBoss.isAlive) return; 

    // 2. Cria a nova instância do Boss
    const newBossInstance = new Boss(
        CANVAS_WIDTH / 2 - 150, // Posição de spawn (usa CANVAS_WIDTH importado)
        -300,
        250, 
        200, 
        "../assets/img/boss/boss.png",
        17000 // Vida
    );

    // 🛑 CORREÇÃO 3: Usar o Setter para definir a instância globalmente.
    setCurrentBoss(newBossInstance); 
    
    // Configuração inicial do estado do Boss
    setBossDefeated(false); 

    // 3. Gerenciamento do DOM (Barra de Vida)
    const barContainer = document.getElementById("bossHealthBarContainer");
    const bar = document.getElementById("bossHealthBar");

    if (barContainer) {
        barContainer.style.display = "block";
    }

    if (bar) {
        bar.style.width = "100%"; 
    }
}