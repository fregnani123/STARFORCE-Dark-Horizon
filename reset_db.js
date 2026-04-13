#!/usr/bin/env node
/**
 * Script para limpar o banco de dados do STARFORCE Dark Horizon
 * Executa antes de iniciar o jogo para migrar o schema
 * 
 * Uso: node reset_db.js
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🔧 Reset do Banco de Dados - STARFORCE Dark Horizon\n');

// Obter caminho AppData
const appDataPath = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
console.log(`📁 AppData: ${appDataPath}\n`);

// Caminhos possíveis para o banco de dados
const possiblePaths = [
    path.join(appDataPath, 'starforce-dark-horizon', 'starforce_data.db'),
    path.join(appDataPath, 'STARFORCE-Dark-Horizon', 'starforce_data.db'),
    path.join(os.homedir(), 'AppData', 'Local', 'starforce-dark-horizon', 'starforce_data.db'),
    path.join(os.homedir(), 'AppData', 'Local', 'Electron', 'starforce_data.db'),
];

let found = false;

for (const dbPath of possiblePaths) {
    if (fs.existsSync(dbPath)) {
        console.log(`✓ Banco de dados encontrado: ${dbPath}`);
        try {
            fs.unlinkSync(dbPath);
            console.log(`✅ Banco deletado com sucesso!\n`);
            console.log('📢 Próximo passo: Inicie o jogo com "npm start"');
            console.log('   O banco será recriado automaticamente com o novo schema.\n');
            found = true;
            break;
        } catch (err) {
            console.error(`❌ Erro ao deletar: ${err.message}`);
        }
    }
}

if (!found) {
    console.log('⚠️  Banco de dados não encontrado nas localizações padrão.');
    console.log('\nCaminhos verificados:');
    possiblePaths.forEach(p => console.log(`  - ${p}`));
    console.log('\nO banco será criado automaticamente ao iniciar o jogo.\n');
}
