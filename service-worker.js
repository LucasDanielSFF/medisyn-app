const CACHE_VERSION = 'v1'; // Atualize este valor sempre que fizer mudanças importantes
const CACHE_NAME = "medisyn-pwa-cd83a35173b0"; // Será substituído pelo script

const urlsToCache = [
  "/",
  "index.html",
  "calculadora.html",
  "medicamentos.html",
  "protocolos.html",
  "css/styles.css",
  "js/calculadora.js",
  "manifest.json",
  "icons/medisyn-192.png",
  "icons/medisyn-512.png",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js",
  "medications/analgesicos/a.json",
  "medications/analgesicos/b.json",
  "medications/analgesicos/c.json",
  "medications/analgesicos/d.json",
  "medications/analgesicos/e.json"
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
        .then(cache => cache.addAll(urlsToCache))
        .then(() => self.skipWaiting()) // Força ativação imediata do novo SW
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName); // Remove caches antigos
          }
        })
      );
    }).then(() => self.clients.claim()) // Assume controle imediato de todas as abas
  );
});

self.addEventListener('fetch', event => {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return fetch(event.request)
          .then(response => {
            // Atualiza o cache com nova resposta
            if(event.request.method === 'GET') {
                cache.put(event.request, response.clone());
            }
            return response;
          })
          .catch(() => {
            // Fallback para cache se offline
            return cache.match(event.request);
          });
      })
    );
  });
