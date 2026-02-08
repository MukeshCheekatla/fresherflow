const CACHE_NAME = 'fresherflow-pwa-v1.4.3';
const OFFLINE_URL = '/offline.html';

// Assets that should be cached on install
const PRECACHE_ASSETS = [
  OFFLINE_URL,
  '/favicon.ico',
  '/manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      for (const url of PRECACHE_ASSETS) {
        try {
          const response = await fetch(url, { redirect: 'follow', cache: 'reload' });
          if (response.ok && response.type !== 'opaqueredirect') {
            await cache.put(url, response.clone());
          }
        } catch {
          // Skip precache item if it fails to fetch
        }
      }
    })()
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => (key === CACHE_NAME ? null : caches.delete(key))))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and browser extensions
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) return;

  const url = new URL(event.request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isApiRequest = url.pathname.startsWith('/api');
  const isNavigation = event.request.mode === 'navigate';
  const isAdminPath = url.pathname.startsWith('/admin');
  const isAuthPath = url.pathname.startsWith('/login') || url.pathname.startsWith('/auth');

  // Let browser handle admin/auth navigations directly to avoid redirect-mode issues.
  if (isNavigation && (isAdminPath || isAuthPath)) {
    return;
  }

  // Network-first for navigations (HTML), with offline fallback
  if (isNavigation) {
    event.respondWith(
      (async () => {
        try {
          // Use URL fetch with credentials so same-origin redirects are followed safely.
          const response = await fetch(url.href, {
            credentials: 'include',
            redirect: 'follow',
            cache: 'no-store'
          });
          return response;
        } catch {
          const offline = await caches.match(OFFLINE_URL);
          return offline || new Response('Offline', { status: 503 });
        }
      })()
    );
    return;
  }

  // Only cache same-origin static assets
  const dest = event.request.destination;
  const isStaticAsset = isSameOrigin && ['style', 'script', 'image', 'font'].includes(dest);

  if (isStaticAsset && !isApiRequest) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
          return cachedResponse || fetchPromise;
        })
      )
    );
  }
});
