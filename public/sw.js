const CACHE_NAME = 'fishing-saas-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/dashboard',
  '/login',
  '/globals.css',
  '/manifest.json'
];

// Install Event - cache core static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: Pre-caching core assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('SW: Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Stale-while-revalidate strategy for internal GET requests
self.addEventListener('fetch', (event) => {
  // CRITICAL FIX: Only handle GET requests. Skip POST, PUT, DELETE, etc.
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // Skip browser extensions (e.g. chrome-extension://)
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Skip dynamic API requests to prevent caching authentication/token responses or breaking live data syncing
  if (url.pathname.startsWith('/api/') || url.pathname.includes('/_next/data/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Fetch network response in background and update cache
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          // Only cache successful basic internal HTTP requests
          if (
            networkResponse && 
            networkResponse.status === 200 && 
            networkResponse.type === 'basic'
          ) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          }
          return networkResponse;
        })
        .catch((err) => {
          console.warn('SW: Network fetch failed for:', event.request.url, err);
        });

      // Return cached response immediately if available, otherwise wait for network
      return cachedResponse || fetchPromise;
    })
  );
});
