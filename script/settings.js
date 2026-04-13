// ======================================================
// SETTINGS MODULE
// ======================================================
import { applyAudioSettings } from './audio_game.js';

let currentSettings = {};
const LANGUAGE_STORAGE_KEY = 'sf_language';

const UI_TEXT = {
    'pt-BR': {
        menuContinue: 'CONTINUAR',
        menuNewGame: 'NOVO JOGO',
        menuSettings: 'CONFIGURACOES',
        menuExit: 'SAIR',
        warningTitle: 'AVISO',
        warningText: 'Iniciar um novo jogo apagara seu progresso atual.',
        warningConfirm: 'Tem certeza que deseja continuar?',
        warningDelete: 'APAGAR E COMECAR',
        warningBack: 'VOLTAR',
        skipCutscene: 'PULAR [ESC]',
        playerTitle: 'REGISTRO DE PILOTO',
        playerPrompt: 'Insira seu codigo de identificacao:',
        playerStart: 'INICIAR MISSAO',
        playerCancel: 'CANCELAR'
    },
    en: {
        menuContinue: 'CONTINUE',
        menuNewGame: 'NEW GAME',
        menuSettings: 'SETTINGS',
        menuExit: 'EXIT',
        warningTitle: 'WARNING',
        warningText: 'Starting a new game will erase your current progress.',
        warningConfirm: 'Are you sure you want to continue?',
        warningDelete: 'ERASE AND START',
        warningBack: 'BACK',
        skipCutscene: 'SKIP [ESC]',
        playerTitle: 'PILOT REGISTRATION',
        playerPrompt: 'Enter your identification code:',
        playerStart: 'START MISSION',
        playerCancel: 'CANCEL'
    },
    es: {
        menuContinue: 'CONTINUAR',
        menuNewGame: 'NUEVA PARTIDA',
        menuSettings: 'CONFIGURACION',
        menuExit: 'SALIR',
        warningTitle: 'AVISO',
        warningText: 'Iniciar una nueva partida borrara tu progreso actual.',
        warningConfirm: 'Estas seguro de que deseas continuar?',
        warningDelete: 'BORRAR Y EMPEZAR',
        warningBack: 'VOLVER',
        skipCutscene: 'SALTAR [ESC]',
        playerTitle: 'REGISTRO DE PILOTO',
        playerPrompt: 'Ingresa tu codigo de identificacion:',
        playerStart: 'INICIAR MISION',
        playerCancel: 'CANCELAR'
    }
};

function normalizeLanguage(lang) {
    if (!lang) return 'pt-BR';
    if (lang.toLowerCase().startsWith('pt')) return 'pt-BR';
    if (lang.toLowerCase().startsWith('es')) return 'es';
    return 'en';
}

function applyLanguageToUI(lang) {
    const key = normalizeLanguage(lang);
    const t = UI_TEXT[key] || UI_TEXT['pt-BR'];

    const map = [
        ['continuar', t.menuContinue],
        ['novo-jogo', t.menuNewGame],
        ['configButton', t.menuSettings],
        ['exit', t.menuExit],
        ['warningText', t.warningText],
        ['confirmarReset', t.warningDelete],
        ['cancelarReset', t.warningBack],
        ['skipCutscene', t.skipCutscene],
        ['confirmarPlayer', t.playerStart],
        ['cancelarPlayer', t.playerCancel]
    ];

    map.forEach(([id, text]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    });

    const playerTitle = document.querySelector('#playerCreationOverlay h2');
    if (playerTitle) playerTitle.textContent = t.playerTitle;

    const playerPrompt = document.querySelector('#playerCreationOverlay p');
    if (playerPrompt) playerPrompt.textContent = t.playerPrompt;

    const warningTitle = document.querySelector('#confirmNewGameOverlay h2');
    if (warningTitle) warningTitle.textContent = `⚠ ${t.warningTitle}`;

    const warningConfirm = document.querySelector('#confirmNewGameOverlay p[style="margin-bottom: 20px;"]');
    if (warningConfirm) warningConfirm.textContent = t.warningConfirm;

    const langSelect = document.getElementById('setting-language');
    if (langSelect) langSelect.value = key;

    localStorage.setItem(LANGUAGE_STORAGE_KEY, key);
    window.dispatchEvent(new CustomEvent('sf-language-changed', { detail: key }));
}

// ── Abre o overlay ──────────────────────────────────────
export async function openSettings() {
    const overlay = document.getElementById('settings-overlay');
    if (!overlay) return;

    currentSettings = await window.dbAPI.getSettings();
    applyToUI(currentSettings);
    overlay.classList.remove('hidden');
}

// ── Fecha o overlay ─────────────────────────────────────
function closeSettings() {
    const overlay = document.getElementById('settings-overlay');
    if (overlay) overlay.classList.add('hidden');
}

// ── Popula os controles com os valores do DB ────────────
function applyToUI(s) {
    setSlider('setting-music-volume', 'val-music-volume', s.musicVolume, '%', 100);
    setSlider('setting-sfx-volume',   'val-sfx-volume',   s.sfxVolume,   '%', 100);
    setToggle('setting-music-enabled',  s.musicEnabled);
    setToggle('setting-sfx-enabled',    s.sfxEnabled);
    setToggle('setting-fullscreen',     s.fullscreen);
    setToggle('setting-control-hints',  s.showControlHints);
    setSelect('setting-particle',   s.particleQuality);
    const normalizedLanguage = normalizeLanguage(s.language);
    setSelect('setting-language', normalizedLanguage);
    applyLanguageToUI(normalizedLanguage);
}

function setSlider(id, valId, value, suffix = '', mult = 1) {
    const el = document.getElementById(id);
    const vl = document.getElementById(valId);
    if (el) el.value = Math.round(value * mult);
    if (vl) vl.textContent = Math.round(value * mult) + suffix;
}

function setToggle(id, value) {
    const el = document.getElementById(id);
    if (el) el.checked = !!value;
}

function setSelect(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value;
}

// ── Lê o estado atual dos controles ─────────────────────
function readFromUI() {
    return {
        musicVolume:      getSliderVal('setting-music-volume', 100),
        sfxVolume:        getSliderVal('setting-sfx-volume',   100),
        musicEnabled:     getToggleVal('setting-music-enabled'),
        sfxEnabled:       getToggleVal('setting-sfx-enabled'),
        fullscreen:       getToggleVal('setting-fullscreen'),
        showControlHints: getToggleVal('setting-control-hints'),
        particleQuality:  getSelectVal('setting-particle'),
        language:         getSelectVal('setting-language'),
    };
}

function getSliderVal(id, div = 1) {
    const el = document.getElementById(id);
    return el ? parseFloat(el.value) / div : 0;
}

function getToggleVal(id) {
    const el = document.getElementById(id);
    return el ? el.checked : false;
}

function getSelectVal(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
}

// ── Aplica audio em tempo real (preview) ────────────────
function applyAudioPreview() {
    const s = readFromUI();
    applyAudioSettings(s);
}

// ── Salva e aplica tudo ──────────────────────────────────
async function saveSettings() {
    const s = readFromUI();
    s.language = normalizeLanguage(s.language);

    // Salva no DB
    await window.dbAPI.saveSettings(s);
    currentSettings = s;

    // Aplica áudio
    applyAudioSettings(s);
    applyLanguageToUI(s.language);

    // Fullscreen
    await window.dbAPI.toggleFullscreen();

    // Feedback visual
    const msg = document.getElementById('settings-saved-msg');
    if (msg) {
        msg.classList.add('visible');
        setTimeout(() => msg.classList.remove('visible'), 2000);
    }
}

// ── Wire-up de eventos dos sliders (preview ao mover) ───
function wireSlider(id, valId, suffix = '', mult = 1) {
    const el = document.getElementById(id);
    const vl = document.getElementById(valId);
    if (!el) return;
    el.addEventListener('input', () => {
        if (vl) vl.textContent = el.value + suffix;
        applyAudioPreview();
    });
}

// ── Inicialização ────────────────────────────────────────
function init() {
    wireSlider('setting-music-volume', 'val-music-volume', '%');
    wireSlider('setting-sfx-volume',   'val-sfx-volume',   '%');

    // Toggles disparam preview de áudio imediatamente
    ['setting-music-enabled', 'setting-sfx-enabled'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', applyAudioPreview);
    });

    const btnClose = document.getElementById('btn-close-settings');
    const btnSave  = document.getElementById('btn-save-settings');

    const langSelect = document.getElementById('setting-language');
    if (langSelect) {
        langSelect.addEventListener('change', () => {
            applyLanguageToUI(langSelect.value);
        });
    }

    if (btnClose) btnClose.addEventListener('click', closeSettings);
    if (btnSave)  btnSave.addEventListener('click', saveSettings);

    // ESC fecha
    document.addEventListener('keydown', (e) => {
        const overlay = document.getElementById('settings-overlay');
        if (e.key === 'Escape' && overlay && !overlay.classList.contains('hidden')) {
            closeSettings();
        }
    });

    // Botão no menu principal
    const btnConfig = document.getElementById('configButton');
    if (btnConfig) btnConfig.addEventListener('click', openSettings);

    // Aplica idioma inicial no boot
    (async () => {
        try {
            const settings = await window.dbAPI.getSettings();
            const lang = normalizeLanguage(settings?.language || localStorage.getItem(LANGUAGE_STORAGE_KEY));
            applyLanguageToUI(lang);
        } catch {
            applyLanguageToUI(normalizeLanguage(localStorage.getItem(LANGUAGE_STORAGE_KEY)));
        }
    })();
}

init();

export { closeSettings };
