#!/usr/bin/env node
/**
 * Script para adicionar class="hidden" ao #loadingOverlay
 * Ao inicializar, o loading estará escondido por padrão
 * E será mostrado via JavaScript quando clicar em uma missão
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public', 'index.html');

try {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Substituir <div id="loadingOverlay"> por <div id="loadingOverlay" class="hidden">
    const before = content;
    content = content.replace(
        '<div id="loadingOverlay">',
        '<div id="loadingOverlay" class="hidden">'
    );
    
    if (content !== before) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log('✅ [SUCESSO] Adicionado class="hidden" ao #loadingOverlay');
        console.log('   Arquivo: public/index.html');
        console.log('   Status: Loading iniciará escondido (correto)');
    } else {
        console.log('⚠️  [AVISO] Nenhuma mudança necessária');
        console.log('   O loading overlay já tem class="hidden" ou não foi encontrado');
    }
} catch (error) {
    console.error('❌ [ERRO] Não foi possível modificar o arquivo:', error.message);
    process.exit(1);
}
