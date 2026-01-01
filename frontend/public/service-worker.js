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

// Push Notification Handler
self.addEventListener('push', (event) => {
    if (!event.data) return;

    try {
        const data = event.data.json();

        const options = {
            body: data.body,
            icon: data.icon || '/favicon.png',
            badge: data.badge || '/favicon.png',
            vibrate: [200, 100, 200],
            data: data.data || {},
            tag: data.tag || 'thecollabify',
            requireInteraction: data.requireInteraction || false,
            actions: data.actions || []
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    } catch (error) {
        console.error('Error handling push event:', error);
    }
});

// Notification Click Handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Check if there's already a window open
                for (const client of clientList) {
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        return client.focus().then(() => {
                            // Navigate to the URL
                            return client.navigate(urlToOpen);
                        });
                    }
                }
                // No window open, open a new one
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});
