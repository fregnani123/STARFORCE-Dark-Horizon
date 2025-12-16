// 🎯 Score necessário para chamar o boss
const BOSS_SCORE_TRIGGER =500;  // altere se quiser
let bossDefeated = false;

let currentBoss = null;

function spawnBoss() {
    if (bossDefeated) return; // já foi morto → não cria mais
    if (currentBoss && currentBoss.isAlive) return; // já existe vivo

    currentBoss = new Boss(
        CANVAS_WIDTH / 2 - 150,
        -300,
        250, // Largura
        200, // Altura (AGORA IGUAL À LARGURA)
        "../assets/img/boss/boss.png",
    17000
    );

    // 🔥 ATIVA A BARRA DE VIDA DO BOSS
    const barContainer = document.getElementById("bossHealthBarContainer");
    const bar = document.getElementById("bossHealthBar");

    if (barContainer) {
        barContainer.style.display = "block";
    }

    if (bar) {
        bar.style.width = "100%"; // reinicia ao aparecer
    }
}