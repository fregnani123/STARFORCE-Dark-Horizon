const fs = require('fs');

const filePath = './public/index.html';
let content = fs.readFileSync(filePath, 'utf-8');

// Substituir <div id="loadingOverlay"> por <div id="loadingOverlay" class="hidden">
content = content.replace(
    '<div id="loadingOverlay">',
    '<div id="loadingOverlay" class="hidden">'
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('✅ Adicionado class "hidden" ao loadingOverlay');
