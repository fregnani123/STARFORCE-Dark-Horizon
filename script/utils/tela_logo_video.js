// Este módulo lida APENAS com a reprodução do vídeo de logo na sessão.

const FGL_PLAYED_KEY = 'hasFGLVideoPlayed';
const FGL_VIDEO_SOURCE = '../assets/video/aberturaLogo.mp4'; 
const BODY = document.body;

/**
 * Lógica principal para reproduzir o vídeo de logo ou pular.
 * Sequência: Loading spinner → Vídeo da empresa → Menu
 * @param {Function} onFinishCallback - Função a ser chamada após o vídeo terminar ou falhar.
 */
export function initLogoVideoLogic(onFinishCallback) {
    const loadingOverlay = document.getElementById('loadingOverlay');
    const HAS_PLAYED_THIS_SESSION = sessionStorage.getItem(FGL_PLAYED_KEY) === 'true';
    const isElectron = window.electronAPI ? true : false;

    // 1. MOSTRAR LOADING IMEDIATAMENTE
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
        loadingOverlay.classList.remove('hidden');
    }

    function removerVideoLogo(videoElement) {
        if (videoElement && videoElement.parentElement === BODY) {
            BODY.removeChild(videoElement);
        }
    }

    // Se já tocou nesta sessão: mantém loading por 1.5s e vai direto ao menu
    if (HAS_PLAYED_THIS_SESSION) {
        console.log("Sessão detectada: pulando vídeo, indo direto ao menu.");
        setTimeout(() => {
            if (loadingOverlay) {
                loadingOverlay.classList.add('hidden');
                loadingOverlay.style.display = 'none';
            }
            onFinishCallback();
        }, 1500);
        return;
    }

    // 2. APÓS 2.5s DE LOADING → exibir vídeo da empresa
    setTimeout(() => {
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
            loadingOverlay.style.display = 'none';
        }

        const logoVideo = document.createElement('video');
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

        if (isElectron) {
            logoVideo.muted = false;
            logoVideo.volume = 1;
        }

        // 3. AO TERMINAR O VÍDEO → chamar menu
        logoVideo.onended = () => {
            sessionStorage.setItem(FGL_PLAYED_KEY, 'true');
            removerVideoLogo(logoVideo);
            onFinishCallback();
        };

        logoVideo.play().catch(err => {
            console.warn("Vídeo bloqueado. Pulando...", err);
            sessionStorage.setItem(FGL_PLAYED_KEY, 'true');
            removerVideoLogo(logoVideo);
            onFinishCallback();
        });

    }, 2500);
}