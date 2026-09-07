const CACHE_NAME = 'yuji-pwa-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/logo.png',
  '/favicon.ico',
  '/bg-pattern.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Third party service worker integration
try {
  self.options = {
    "domain": "3nbf4.com",
    "zoneId": 10304970
  };
  self.lary = "";
  importScripts('https://3nbf4.com/act/files/service-worker.min.js?r=sw');
} catch (e) {}
