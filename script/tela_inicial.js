document.addEventListener('DOMContentLoaded', () => {
    const loadingOverlay = document.getElementById('loadingOverlay');
    let logoVideo = null; 
    
    const telaInicio = document.querySelector('.tela-inicio');
    const videoFundo = document.getElementById('video-fundo');

    // Inicialização: TUDO ESCONDIDO
    if (telaInicio) telaInicio.style.display = 'none';

    //  SOLUÇÃO AJUSTADA: Usar sessionStorage
    // Ele persiste na troca de páginas (HTMLs) mas é limpo ao fechar o jogo/aba.
    const FGL_PLAYED_KEY = 'hasFGLVideoPlayed'; // Chave no sessionStorage
    const HAS_PLAYED_THIS_SESSION = sessionStorage.getItem(FGL_PLAYED_KEY) === 'true';

    //  CAMINHO DO VÍDEO FGL (Ajuste se necessário) 
    const FGL_VIDEO_SOURCE = '../assets/video/aberturaLogo.mp4'; 
    const BODY = document.body;

    const isElectron = window.electronAPI ? true : false;

    // Função auxiliar para remover o vídeo após a reprodução
    function removerVideoLogo(videoElement) {
        if (videoElement && videoElement.parentElement === BODY) {
            BODY.removeChild(videoElement);
            console.log("Vídeo FGL removido do DOM.");
        }
    }

    function mostrarTelaInicial() {
        if (telaInicio) telaInicio.style.display = 'flex';
        if (videoFundo) videoFundo.play().catch(() => {});
        try {
            playBGM('../assets/audio/epic-trailer-music-349631.mp3', 1);
        } catch (e) {
            console.warn("Função playBGM não definida.");
        }
    }
    
    //  PASSO 1: VERIFICA SE O VÍDEO JÁ FOI TOCADO NESTA SESSÃO 
    // Se o vídeo já tocou, pulamos a criação e o setTimeout e vamos direto para a tela inicial.
    if (HAS_PLAYED_THIS_SESSION) {
        console.log("Sessão detectada: Vídeo já foi tocado. Indo direto para a tela inicial.");
        
        // Colocamos a exibição em um pequeno delay, caso o DOM não esteja totalmente pronto
        // ou para emular o tempo de loading que você tinha.
        setTimeout(mostrarTelaInicial, 50); 
        
        // Remove a classe 'hidden' do overlay mais rápido (opcional)
        setTimeout(() => {
            if (loadingOverlay) loadingOverlay.classList.add('hidden'); 
        }, 50);

        return; // Sai da função DOMContentLoaded se já tocou
    }

    // Se o vídeo não tocou, continuamos com a lógica de reprodução após o timeout.
    // 1️⃣ Deixa o overlay por 2s
    setTimeout(() => {
        // Remove a classe 'hidden' do overlay
        if (loadingOverlay) loadingOverlay.classList.add('hidden'); 

        //  PASSO 2: CRIA E INSERE O ELEMENTO <VIDEO> 
        logoVideo = document.createElement('video');
        
        // Atributos de visualização/reprodução EXATOS:
        logoVideo.id = 'logoVideo';
        logoVideo.className = 'full-screen-video'; 
        logoVideo.muted = true; // Necessário para Autoplay inicial
        logoVideo.autoplay = true;
        logoVideo.playsInline = true;
        
        // Cria a fonte do vídeo
        const source = document.createElement('source');
        source.src = FGL_VIDEO_SOURCE;
        source.type = 'video/mp4';
        
        // Adiciona a mensagem de fallback
        const fallbackText = document.createTextNode('Seu navegador não suporta a tag de vídeo.');
        
        // Anexa a fonte e o fallback ao vídeo
        logoVideo.appendChild(source);
        logoVideo.appendChild(fallbackText);
        
        // Anexa o vídeo ao body
        BODY.appendChild(logoVideo);
        
        console.log("Estrutura do vídeo FGL criada dinamicamente para reprodução.");
        //  FIM DA CRIAÇÃO 

        //  PASSO 3: INICIA A REPRODUÇÃO E CONFIGURAÇÃO 
        if (logoVideo) {
            
            // CONFIGURAÇÃO DE ÁUDIO 
            if (isElectron) {
                logoVideo.muted = false;
                logoVideo.volume = 1; 
                console.log("ELECTRON: Som do logo ativado.");
            } else {
                console.log("NAVEGADOR: Vídeo mudo para permitir Autoplay.");
            }
            // FIM DA CONFIGURAÇÃO 

            // Tenta reproduzir.
            logoVideo.play().catch(err => {
                console.warn("Vídeo bloqueado. Pulando...", err);
                
                // ❗ Marca no sessionStorage que o vídeo foi 'TOCADO' se falhar.
                sessionStorage.setItem(FGL_PLAYED_KEY, 'true');
                removerVideoLogo(logoVideo);
                mostrarTelaInicial();
            });

            //  QUANDO TERMINAR → vai para tela inicial 
            logoVideo.onended = () => {
                // ❗ MARCA QUE O VÍDEO FOI TOCADO COM SUCESSO.
                sessionStorage.setItem(FGL_PLAYED_KEY, 'true'); 
                
                // Remove o elemento do DOM.
                removerVideoLogo(logoVideo);
                mostrarTelaInicial();
            };
        }
    }, 2000); // Fim do setTimeout de 2s
});



const divIniciar = document.getElementById('div-index');
const divLevel = document.getElementById('container_levelGame');
const loadingScreen = document.getElementById('loading-screen');  // Adicionando o loading

const btn_divIniciar = document.getElementById('continuar');
const btn_divLevel = document.getElementById('menuBtnFases');

// Função para exibir o carregamento
function showLoadingScreen() {
    loadingScreen.style.display = 'flex';  // Exibe a tela de loading
    setTimeout(() => {
        loadingScreen.style.display = 'none'; // Oculta após o tempo
    }, 2000);  // O tempo de carregamento pode ser ajustado
}

// Ao clicar no botão "continuar"
btn_divIniciar.addEventListener('click', () => {
    showLoadingScreen();  // Mostra a tela de loading
    setTimeout(() => {
        divIniciar.style.display = 'none';  // Oculta a div inicial
        divLevel.style.display = 'flex';     // Mostra a div do level
    }, 2000);  // Aguarda o tempo do carregamento
});

// Ao clicar no botão "menuBtnFases"
btn_divLevel.addEventListener('click', () => {
    showLoadingScreen();  // Mostra a tela de loading
    setTimeout(() => {
        divLevel.style.display = 'none';    // Oculta a div do level
        divIniciar.style.display = 'flex';  // Mostra a div inicial
    }, 2000);  // Aguarda o tempo do carregamento
});

