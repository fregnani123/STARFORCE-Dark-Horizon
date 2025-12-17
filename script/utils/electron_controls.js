// Função para anexar o evento de saída ao botão
export function setupExitButton() {
    // Busca o botão pelo ID (que está no index.html)
    const exitButton = document.getElementById('exit');

    if (exitButton) {
        // Usa uma Arrow Function para sintaxe moderna
        exitButton.addEventListener('click', () => {
            // Verifica se a API do Electron (ipcRenderer) está disponível
            if (window.electronAPI && window.electronAPI.closeApp) {
                window.electronAPI.closeApp();
            } else {
                alert("Funcionalidade disponível apenas na versão desktop (Electron).");
            }
        });
    }
}

// O código repetido de listeners no HTML será removido.