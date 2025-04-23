const CACHE_NAME = "medisyn-pwa-v1";
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
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
