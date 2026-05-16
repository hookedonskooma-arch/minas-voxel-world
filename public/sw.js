const CACHE_NAME = 'minas-world-v1';
const STATIC_ASSETS = [
  '/',
  '/onboarding',
  '/studio',
  '/worlds',
  '/friends',
  '/inventory',
  '/quests',
  '/parent',
  '/widgets',
  '/styles/design-system.css',
  '/assets/mina-world-logo.svg',
];

self.addEventListener('install', (event: any) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event: any) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event: any) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request).catch(() => {
          // Fallback for offline
          if (event.request.mode === 'navigate') {
            return caches.match('/onboarding');
          }
          return new Response('Offline', { status: 503 });
        })
      );
    })
  );
});
