// generate-sw.js
const { createHash } = require('crypto');
const fs = require('fs');
const path = require('path');

// Função para ler todos os arquivos de um diretório recursivamente
function getAllFiles(dirPath, filesList = []) {
  const files = fs.readdirSync(dirPath, { withFileTypes: true });

  files.forEach(file => {
    const fullPath = path.join(dirPath, file.name);
    if (file.isDirectory()) {
      getAllFiles(fullPath, filesList);
    } else {
      filesList.push(fullPath);
    }
  });

  return filesList;
}

// 1. Gerar hash baseado no conteúdo dos arquivos e data/hora atual
const directoryToHash = '../public'; // Altere para o diretório desejado
const filesToHash = getAllFiles(directoryToHash).sort(); // Ordena para consistência
let hash = createHash('sha256');

// Adiciona a data/hora atual ao hash
const currentDate = new Date().toISOString();
hash.update(currentDate);

// Adiciona conteúdo dos arquivos ao hash
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

console.log('Service Worker atualizado com hash:', dynamicHash, 'Gerado em:', currentDate);