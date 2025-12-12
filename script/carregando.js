/**
 * Lógica Universal para Gerenciar o Overlay de Carregamento.
 * Garante que o overlay seja exibido por um tempo mínimo, mesmo que o carregamento seja instantâneo.
 */

const loadingOverlay = document.getElementById('loadingOverlay');
let isContentLoaded = false;
let isMinimumTimeElapsed = false;

// 🎯 NOVO TEMPO MÍNIMO REQUERIDO: 2000 milissegundos (2 segundos)
const MINIMUM_DISPLAY_TIME_MS = 2000; 

// Função que realmente remove o overlay (somente é chamada quando as duas condições são satisfeitas)
function hideLoadingOverlay() {
    // Se o loadingOverlay ainda existir (pode ser removido por outro script em caso de erro crítico)
    if (loadingOverlay && isContentLoaded && isMinimumTimeElapsed) {
        // Usamos add('hidden') para transições suaves
        loadingOverlay.classList.add('hidden');
        
        // Opcional: Remove o elemento do DOM após a transição (1 segundo depois)
        setTimeout(() => {
            loadingOverlay.remove();
        }, 1000); 
    }
}

// 1. Inicia o Timer para o Tempo Mínimo de Exibição (2 segundos)
setTimeout(() => {
    isMinimumTimeElapsed = true;
    console.log("Tempo mínimo de exibição (2s) atingido.");
    
    // Tenta esconder o overlay se o conteúdo já estiver carregado
    hideLoadingOverlay();
    
}, MINIMUM_DISPLAY_TIME_MS);


// 2. Escuta quando todos os elementos HTML e DOM estão prontos E o vídeo pode ser reproduzido
document.addEventListener('DOMContentLoaded', () => {
    
    const videoBackground = document.getElementById('video-background');

    if (videoBackground) {
        // Usa 'canplaythrough' (o mais seguro) para saber que a mídia está pronta
        videoBackground.addEventListener('canplaythrough', () => {
            isContentLoaded = true;
            console.log("Conteúdo principal (vídeo) carregado.");
            hideLoadingOverlay();
        }, { once: true });
        
        // Fallback: Se o evento 'canplaythrough' não for disparado após 3 segundos do DOM Load
        setTimeout(() => {
             if (!isContentLoaded) {
                isContentLoaded = true;
                console.warn("Forçando status 'Conteúdo Carregado' após timeout de segurança.");
                hideLoadingOverlay();
             }
        }, 3000); 
        
    } else {
        // Se a tela não tiver vídeo de fundo, o DOM pronto é suficiente.
        isContentLoaded = true;
        console.log("Conteúdo estático carregado (Sem vídeo de fundo).");
        hideLoadingOverlay();
    }
});