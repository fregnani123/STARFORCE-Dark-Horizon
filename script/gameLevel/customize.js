

// ======================================================
// GERENCIADOR DE CUSTOMIZAÇÃO (HULL / CHASSI)
// ======================================================

const div_customize = document.getElementById('customize-hull-overlay');
const btn_close = document.getElementById('btn-close-customize');

// 🛑 IMPORTANTE: O botão que ABRE a div geralmente fica na tela principal (fora do modal)
// Procure o ID correto do botão que fica no seu Menu Principal
const btn_open = document.getElementById('btn_customize_open'); 

/**
 * Abre o menu de customização
 */
export function openCustomizeHull(e) {
    if (e) e.preventDefault();
    if (div_customize) {
        div_customize.style.display = 'flex'; // Exibe o modal
        console.log("Hangar aberto");
    }
}

/**
 * Fecha o menu de customização
 */
export function closeDiv(e) {
    if (e) e.preventDefault();
    if (div_customize) {
        div_customize.style.display = 'none'; // Esconde o modal
        console.log("Hangar fechado");
    }
}

// --- CONFIGURAÇÃO DOS LISTENERS ---

// Listener para FECHAR (Botão X dentro do modal)
if (btn_close) {
    btn_close.removeEventListener('click', openCustomizeHull); // Garante que não haja duplicata errada
    btn_close.addEventListener('click', closeDiv); // 🛑 CORRIGIDO: Botão close chama closeDiv
}

// Listener para ABRIR (Botão no menu principal)
if (btn_open) {
    btn_open.addEventListener('click', openCustomizeHull); // 🛑 CORRIGIDO: Botão open chama openCustomize
}

// Fechar ao clicar na área escura (Overlay)
if (div_customize) {
    div_customize.addEventListener('click', (e) => {
        // Se clicar no fundo (fora do modal branco/escuro)
        if (e.target === div_customize) {
            closeDiv();
        }
    });
}