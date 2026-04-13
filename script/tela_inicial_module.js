// Importa a função de reprodução de áudio (assumindo que existe em audio_game.js)
import { playBGM } from './audio_game.js'; 

// Elementos do DOM

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
    const divIndex = document.getElementById('div-index');
    if (divIndex) divIndex.style.display = 'flex';
    if (telaInicio) telaInicio.style.display = 'flex';
    if (videoFundo) videoFundo.play().catch(() => {});
    
    // Inicia a música de fundo
    try {
        playBGM('../assets/audio/musicaGameBR.mp3', 1); 
    } catch (e) {
        console.warn("Módulo de áudio (playBGM) não importado ou definido.");
    }
}



/**
 * Função principal a ser exportada para o init.js
 */
export function initTelaInicial() {

    
    // 2. Chama a lógica do vídeo de logo. O callback será 'mostrarTelaInicial'.
    // NOTE: A função initLogoVideoLogic deve ser importada no init.js e passada para cá,
    // ou importada diretamente aqui (se quisermos acoplar os dois módulos).
    // Vou deixar o init.js orquestrar para maior clareza.
    
    // NOVO MODELO: A orquestração final será feita no init.js
}