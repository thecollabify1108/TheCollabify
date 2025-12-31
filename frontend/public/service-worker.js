const CACHE_NAME = 'collabify-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/logo.png',
    '/logo-full.png',
    '/star-logo.png',
    '/favicon.png'
];

// Install Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate & Cleanup Old Caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// Fetch Strategy: Stale-While-Revalidate for navigations, Cache First for assets
self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) return;

    // For API requests, Network First
    if (event.request.url.includes('/api/')) {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    // Could return a fallback JSON if offline
                    return new Response(JSON.stringify({ error: 'Network error' }), {
                        headers: { 'Content-Type': 'application/json' }
                    });
                })
        );
        return;
    }

    // For other requests, Cache First, falling back to Network
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request).then((response) => {
                // Return 404 if not found
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }

                // Cache the new resource
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });

                return response;
            });
        }).catch(() => {
            // Offline fallback for navigation (HTML)
            if (event.request.mode === 'navigate') {
                return caches.match('/index.html');
            }
        })
    );
});
