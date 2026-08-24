const CACHE_NAME = 'fishing-saas-v3';
// Chỉ cache những đường dẫn chắc chắn tồn tại
const ASSETS_TO_CACHE = [
  '/',
  '/login',
  '/manifest.json'
];

// Install Event - cache core static assets safely
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: Pre-caching core assets');
      // Dùng Promise.allSettled để không crash nếu 1 asset lỗi
      return Promise.allSettled(
        ASSETS_TO_CACHE.map(url =>
          cache.add(url).catch(err => console.warn('SW: Could not cache', url, err))
        )
      );
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
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          // Only cache successful basic internal HTTP requests
          if (
            networkResponse && 
            networkResponse.ok && 
            networkResponse.type === 'basic'
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse); // Fallback to cache on network error

      return cachedResponse || fetchPromise;
    })
  );
});

// Handle clicking on notifications to open/focus the PWA app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If there's an open window matching the target url, focus it
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
