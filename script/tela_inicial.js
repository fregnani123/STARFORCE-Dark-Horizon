document.addEventListener('DOMContentLoaded', () => {
    const loadingOverlay = document.getElementById('loadingOverlay');
    const logoVideo = document.getElementById('logoVideo');
    const telaInicio = document.querySelector('.tela-inicio');
    const videoFundo = document.getElementById('video-fundo');

    // Inicialização: TUDO ESCONDIDO
    if (telaInicio) telaInicio.style.display = 'none';
    if (logoVideo) logoVideo.style.display = 'none';

    // Função de verificação do ambiente (Pode ser ajustada)
    const isElectron = window.electronAPI ? true : false;
    
    // 1️⃣ Deixa o overlay por 2s
    setTimeout(() => {

        // Remove a classe 'hidden' do overlay
        if (loadingOverlay) loadingOverlay.classList.add('hidden'); 

        // 2️⃣ Exibe vídeo da logo fullscreen
        if (logoVideo) {
            logoVideo.style.display = 'block';

            // 🌟 AJUSTE PARA O SOM NO ELECTRON 🌟
            if (isElectron) {
                // Se for o Electron (App instalado), ativamos o som.
                logoVideo.muted = false;
                logoVideo.volume = 1; 
                console.log("ELECTRON: Som do logo ativado.");
            } else {
                // Se for Navegador (Web), mantemos mudo para evitar bloqueio.
                logoVideo.muted = true;
                logoVideo.volume = 0;
                console.log("NAVEGADOR: Vídeo mudo para permitir Autoplay.");
            }
            // 🌟 FIM DO AJUSTE 🌟

            logoVideo.play().catch(err => {
                console.warn("Vídeo bloqueado. Pulando...", err);
                mostrarTelaInicial();
            });

            // 3️⃣ Quando terminar → vai para tela inicial
            logoVideo.onended = () => {
                // Aplicamos a classe que contém 'display: none !important'
                logoVideo.classList.add('hidden-logo'); 
                mostrarTelaInicial();
            };
        } else {
            // Fallback se o logoVideo não for encontrado
            mostrarTelaInicial();
        }

    }, 2000);

    function mostrarTelaInicial() {
        
        if (telaInicio) telaInicio.style.display = 'flex';

        if (videoFundo) videoFundo.play().catch(() => {});

        try {
            // playBGM precisa ser definida em outro lugar
            playBGM('../assets/audio/tela-inicio.mp3', 1);
        } catch (e) {
            console.warn("Função playBGM não definida.");
        }
    }
});