// generate-sw.js
const { createHash } = require('crypto');
const fs = require('fs');

// 1. Gere um hash baseado no conteúdo dos arquivos
const filesToHash = [
  'js/calculadora.js',
  'js/medicationsDB.js'
];

let hash = createHash('sha256');
filesToHash.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  hash.update(content);
});
const dynamicHash = hash.digest('hex').slice(0, 12); // Ex: "a1b2c3d4e5f6"

// 2. Atualize o service-worker.js com o novo hash
const swContent = fs.readFileSync('service-worker.js', 'utf8');
const updatedSwContent = swContent.replace(
  /const CACHE_NAME = "[^"]+";/,
  `const CACHE_NAME = "medisyn-pwa-${dynamicHash}";`
);
fs.writeFileSync('service-worker.js', updatedSwContent, 'utf8');

console.log('Service Worker atualizado com hash:', dynamicHash);