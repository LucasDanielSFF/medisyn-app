const CACHE_VERSION = 'v1';
const CACHE_NAME = "medisyn-pwa-8853e6d7c972";

const urlsToCache = [
  "../index.html",
  "../calculadora.html",
  "../medicamentos.html",
  "../protocolos.html",
  "../public/css/styles.css",
  "../public/js/calculadora.js",
  "./sw/manifest.json",
  "./icons/medisyn-192.png",
  "./icons/medisyn-512.png",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js",
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
        .then(cache => cache.addAll(urlsToCache))
        .then(() => self.skipWaiting())
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
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return fetch(event.request)
          .then(response => {
            if(event.request.method === 'GET') {
                cache.put(event.request, response.clone());
            }
            return response;
          })
          .catch(() => {
            return cache.match(event.request);
          });
      })
    );
  });
