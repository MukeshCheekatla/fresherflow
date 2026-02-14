const SW_VERSION = '1.4.8';
const STATIC_CACHE = `fresherflow-static-${SW_VERSION}`;
const API_CACHE = `fresherflow-api-${SW_VERSION}`;
const OFFLINE_URL = '/offline.html';

// Assets that should be cached on install
const PRECACHE_ASSETS = [
  OFFLINE_URL,
  '/',
  '/dashboard',
  '/opportunities',
  '/jobs',
  '/internships',
  '/walk-ins',
  '/favicon.ico',
  '/manifest.webmanifest'
];

const API_CACHE_PREFIXES = [
  '/api/opportunities',
  '/api/dashboard/highlights',
  '/api/dashboard/deadlines',
  '/api/saved',
  '/api/actions',
  '/api/alerts',
];

function isCacheableApiRequest(url) {
  return API_CACHE_PREFIXES.some((prefix) => url.pathname.startsWith(prefix));
}

async function cleanupOldCaches() {
  const valid = new Set([STATIC_CACHE, API_CACHE]);
  const keys = await caches.keys();
  await Promise.all(
    keys.map((key) => (valid.has(key) ? Promise.resolve() : caches.delete(key)))
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
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
  event.waitUntil(cleanupOldCaches());
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and browser extensions
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) return;

  const url = new URL(event.request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isApiRequest = url.pathname.startsWith('/api');
  const isNavigation = event.request.mode === 'navigate';
  // Handle navigation requests by serving cached offline page if network fails
  if (isNavigation) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC_CACHE);
        const navigationKey = new Request(url.pathname || '/', { method: 'GET' });
        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse && networkResponse.ok) {
            cache.put(navigationKey, networkResponse.clone());
          }
          return networkResponse;
        } catch {
          const cachedNavigation = await cache.match(navigationKey);
          if (cachedNavigation) return cachedNavigation;
          return (await caches.match(OFFLINE_URL)) || Response.error();
        }
      })()
    );
    return;
  }

  // Cache key ignores tracking params so the same feed/search request can be reused.
  const normalizedUrl = new URL(url.pathname + url.search, self.location.origin);
  normalizedUrl.searchParams.delete('utm_source');
  normalizedUrl.searchParams.delete('utm_medium');
  normalizedUrl.searchParams.delete('utm_campaign');
  normalizedUrl.searchParams.delete('utm_term');
  normalizedUrl.searchParams.delete('utm_content');
  normalizedUrl.searchParams.delete('ref');
  const cacheKey = new Request(normalizedUrl.toString(), { method: 'GET' });

  // Only cache same-origin static assets
  const dest = event.request.destination;
  const isStaticAsset = isSameOrigin && ['style', 'script', 'image', 'font'].includes(dest);

  if (isStaticAsset && !isApiRequest) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) =>
        cache.match(cacheKey).then((cachedResponse) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(cacheKey, networkResponse.clone());
            }
            return networkResponse;
          });
          return cachedResponse || fetchPromise;
        })
      )
    );
    return;
  }

  // Deeper offline support for feed/search/deadline APIs
  if (isSameOrigin && isApiRequest && isCacheableApiRequest(url)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(API_CACHE);

        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse && networkResponse.ok && networkResponse.type !== 'opaqueredirect') {
            cache.put(cacheKey, networkResponse.clone());
          }
          return networkResponse;
        } catch {
          const cached = await cache.match(cacheKey);
          if (cached) return cached;
          return new Response(
            JSON.stringify({
              error: 'Offline and no cached data available yet',
              offline: true,
            }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }
      })()
    );
  }
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
