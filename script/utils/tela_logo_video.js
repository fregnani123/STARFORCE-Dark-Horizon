// Este módulo lida APENAS com a reprodução do vídeo de logo na sessão.

const FGL_PLAYED_KEY = 'hasFGLVideoPlayed';
const FGL_VIDEO_SOURCE = '../assets/video/aberturaLogo.mp4'; 
const BODY = document.body;

/**
 * Lógica principal para reproduzir o vídeo de logo ou pular.
 * @param {Function} onFinishCallback - Função a ser chamada após o vídeo terminar ou falhar.
 */
export function initLogoVideoLogic(onFinishCallback) {
    const loadingOverlay = document.getElementById('loadingOverlay');
    const HAS_PLAYED_THIS_SESSION = sessionStorage.getItem(FGL_PLAYED_KEY) === 'true';
    const isElectron = window.electronAPI ? true : false;

    // Função auxiliar para remover o vídeo após a reprodução
    function removerVideoLogo(videoElement) {
        if (videoElement && videoElement.parentElement === BODY) {
            BODY.removeChild(videoElement);
            console.log("Vídeo FGL removido do DOM.");
        }
    }
    
    // Se já tocou, vai direto para o callback (que será 'mostrarTelaInicial')
    if (HAS_PLAYED_THIS_SESSION) {
        console.log("Sessão detectada: Vídeo já foi tocado. Indo direto para a tela inicial.");
        
        // Pequeno delay para emular loading
        setTimeout(onFinishCallback, 50); 
        setTimeout(() => {
            if (loadingOverlay) loadingOverlay.classList.add('hidden'); 
        }, 50);

        return; 
    }

    // Se o vídeo NÃO tocou, iniciamos a exibição após o timeout de loading.
    setTimeout(() => {
        // 1. Oculta o overlay de loading
        if (loadingOverlay) loadingOverlay.classList.add('hidden'); 

        // 2. Cria e Insere o elemento <VIDEO> 
        let logoVideo = document.createElement('video');
        logoVideo.id = 'logoVideo';
        logoVideo.className = 'full-screen-video'; 
        logoVideo.muted = true; 
        logoVideo.autoplay = true;
        logoVideo.playsInline = true;
        
        const source = document.createElement('source');
        source.src = FGL_VIDEO_SOURCE;
        source.type = 'video/mp4';
        
        logoVideo.appendChild(source);
        BODY.appendChild(logoVideo);
        
        console.log("Estrutura do vídeo FGL criada dinamicamente.");

        // 3. Configuração de Áudio (Electron)
        if (isElectron) {
            logoVideo.muted = false;
            logoVideo.volume = 1; 
        }

        // 4. Inicia a reprodução
        logoVideo.play().catch(err => {
            console.warn("Vídeo bloqueado. Pulando...", err);
            sessionStorage.setItem(FGL_PLAYED_KEY, 'true');
            removerVideoLogo(logoVideo);
            onFinishCallback();
        });

        // 5. Quando terminar
        logoVideo.onended = () => {
            sessionStorage.setItem(FGL_PLAYED_KEY, 'true'); 
            removerVideoLogo(logoVideo);
            onFinishCallback();
        };

    }, 2000); // Fim do setTimeout de 2s (duração do loading inicial)
}