// Importa a função de reprodução de áudio (assumindo que existe em audio_game.js)
import { playBGM } from './audio_game.js'; 

// Elementos do DOM
const divIniciar = document.getElementById('div-index');
const divLevel = document.getElementById('container_levelGame');
const loadingScreen = document.getElementById('loading-screen'); 
const telaInicio = document.querySelector('.tela-inicio');
const videoFundo = document.getElementById('video-fundo');

// Funções de transição de tela
function showLoadingScreen(callback) {
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
    }
    const delay = 2000; // Tempo de carregamento
    setTimeout(() => {
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        if (callback) {
            callback();
        }
    }, delay); 
}

/**
 * Exibe a tela inicial (Menu principal).
 * Esta função é chamada como callback após o vídeo de logo.
 */
export function mostrarTelaInicial() {
    if (telaInicio) telaInicio.style.display = 'flex';
    if (videoFundo) videoFundo.play().catch(() => {});
    
    // Inicia a música de fundo
    try {
        playBGM('../assets/audio/epic-trailer-music-349631.mp3', 1);
    } catch (e) {
        console.warn("Módulo de áudio (playBGM) não importado ou definido.");
    }
}

// Lógica de Event Listeners
function setupTelaInicialListeners() {
    const btn_divIniciar = document.getElementById('continuar'); // NOVO JOGO
    const btn_divLevel = document.getElementById('menuBtnFases'); // Voltar para o menu

    // Inicialização: TUDO ESCONDIDO
    if (telaInicio) telaInicio.style.display = 'none';

    // Ao clicar no botão "NOVO JOGO" -> Vai para a tela de Level/Missões
    if (btn_divIniciar) {
        btn_divIniciar.addEventListener('click', () => {
            showLoadingScreen(() => {
                if (divIniciar) divIniciar.style.display = 'none';
                if (divLevel) divLevel.style.display = 'flex';
            });
        });
    }

    // Ao clicar no botão "menuBtnFases" -> Volta para a div inicial
    if (btn_divLevel) {
        btn_divLevel.addEventListener('click', () => {
            showLoadingScreen(() => {
                if (divLevel) divLevel.style.display = 'none';
                if (divIniciar) divIniciar.style.display = 'flex';
            });
        });
    }
}

/**
 * Função principal a ser exportada para o init.js
 */
export function initTelaInicial() {
    // 1. Configura os event listeners da tela inicial e de nível
    setupTelaInicialListeners();
    
    // 2. Chama a lógica do vídeo de logo. O callback será 'mostrarTelaInicial'.
    // NOTE: A função initLogoVideoLogic deve ser importada no init.js e passada para cá,
    // ou importada diretamente aqui (se quisermos acoplar os dois módulos).
    // Vou deixar o init.js orquestrar para maior clareza.
    
    // NOVO MODELO: A orquestração final será feita no init.js
}