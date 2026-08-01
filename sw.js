/* Basic PWA service worker for the static multi-page app */

const CACHE_VERSION = 'v1';
const CACHE_NAME = `shat-cache-${CACHE_VERSION}`;

const CORE_ASSETS = [
  './',
  './index.html',
  './auth.html',
  './chats.html',
  './chatting.html',
  './contacts.html',
  './friends.html',
  './calls.html',
  './calling.html',
  './receiving-call.html',
  './stories.html',
  './settings.html',
  './CSS/index.css',
  './CSS/chats.css',
  './CSS/chatting.css',
  './CSS/contacts.css',
  './CSS/friends.css',
  './CSS/stories.css',
  './CSS/settings.css',
  './CSS/call.css',
  './CSS/notifications.css',
  './CSS/profile.css',
  './js/notifications.js',
  './js/fcm-service.js',
  './manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(CORE_ASSETS);
      // Activate immediately
      self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

function isNavigationRequest(request) {
  return request.mode === 'navigate' || (request.destination === 'document');
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // SPA/navigation handling: offline => index.html
  if (isNavigationRequest(request)) {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          return fresh;
        } catch (err) {
          const cache = await caches.open(CACHE_NAME);
          const cachedIndex = await cache.match('./index.html');
          return cachedIndex || new Response('Offline', { status: 200, headers: { 'Content-Type': 'text/plain' } });
        }
      })()
    );
    return;
  }

  // Cache-first for same-origin GET assets
  if (request.method === 'GET') {
    const url = new URL(request.url);
    if (url.origin === self.location.origin) {
      event.respondWith(
        (async () => {
          const cache = await caches.open(CACHE_NAME);
          const cached = await cache.match(request);
          if (cached) return cached;
          const fresh = await fetch(request);
          // Only cache successful responses
          if (fresh && fresh.status === 200 && fresh.type === 'basic') {
            cache.put(request, fresh.clone()).catch(() => {});
          }
          return fresh;
        })()
      );
      return;
    }
  }
});

