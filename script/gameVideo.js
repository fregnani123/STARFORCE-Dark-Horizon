
document.addEventListener('DOMContentLoaded', () => {
    const videoFundo = document.getElementById('video-fundo');
    const videoOverlay = document.getElementById('video-overlay'); // Buscando o novo elemento

    if (videoFundo && videoOverlay) {
        // Ouve o evento de FIM do vídeo
        videoFundo.addEventListener('ended', () => {
            console.log("Vídeo de fundo terminou. Iniciando transição de fumaça/degrade.");
            
            // ⭐ AÇÃO CHAVE: Adiciona a classe que inicia a transição CSS (opacidade de 0 para 1)
            videoOverlay.classList.add('fade-in-smoke');
            
            // Opcional: Remover o vídeo da tela 2 segundos depois (duração da transição)
            setTimeout(() => {
                 videoFundo.remove();
            }, 1000); 
        });
    }

    // ... Outros listeners de botões, etc.
});