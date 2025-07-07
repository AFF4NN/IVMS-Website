// Service Worker for IVMS Website
// Version 1.0.0

const CACHE_NAME = 'ivms-website-v1';
const STATIC_CACHE = 'ivms-static-v1';
const DYNAMIC_CACHE = 'ivms-dynamic-v1';

// Resources to cache immediately
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/about.html',
    '/contact.html',
    '/speedsense.html',
    '/logistics.html',
    '/rental-leasing.html',
    '/governments.html',
    '/src/css/styles.css',
    '/src/css/performance-optimizations.css',
    '/src/js/main.js',
    '/src/js/roi-calculator.js',
    '/src/js/image-optimization.js',
    '/src/js/contact-form.js',
    '/src/images/ivms-logo.png',
    'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Resources to cache dynamically
const DYNAMIC_ASSETS_PATTERNS = [
    /^https:\/\/fonts\.googleapis\.com/,
    /^https:\/\/fonts\.gstatic\.com/,
    /\/src\/images\//,
    /\/src\/videos\//
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                return self.skipWaiting();
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                return self.clients.claim();
            })
    );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip Chrome extension requests
    if (url.protocol === 'chrome-extension:') {
        return;
    }

    // Handle different types of requests with appropriate strategies
    if (isStaticAsset(request.url)) {
        // Cache First strategy for static assets
        event.respondWith(cacheFirst(request));
    } else if (isHTMLPage(request.url)) {
        // Network First strategy for HTML pages
        event.respondWith(networkFirst(request));
    } else if (isDynamicAsset(request.url)) {
        // Stale While Revalidate for images and dynamic content
        event.respondWith(staleWhileRevalidate(request));
    } else {
        // Network First for everything else
        event.respondWith(networkFirst(request));
    }
});

// Cache First Strategy - good for static assets
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        // Return fallback for failed requests
        return getFallbackResponse(request);
    }
}

// Network First Strategy - good for HTML pages
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        return getFallbackResponse(request);
    }
}

// Stale While Revalidate Strategy - good for images and dynamic content
async function staleWhileRevalidate(request) {
    const cachedResponse = await caches.match(request);
    
    const fetchPromise = fetch(request).then(async (networkResponse) => {
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    }).catch(() => {
        // Network failed, return cached version if available
        return cachedResponse;
    });

    // Return cached version immediately if available, otherwise wait for network
    return cachedResponse || fetchPromise;
}

// Helper functions
function isStaticAsset(url) {
    return STATIC_ASSETS.some(asset => url.endsWith(asset)) ||
           url.includes('/src/css/') ||
           url.includes('/src/js/') ||
           url.includes('tailwindcss') ||
           url.includes('font-awesome');
}

function isHTMLPage(url) {
    return url.includes('.html') || 
           url.endsWith('/') ||
           (!url.includes('.') && !url.includes('api'));
}

function isDynamicAsset(url) {
    return DYNAMIC_ASSETS_PATTERNS.some(pattern => pattern.test(url));
}

function getFallbackResponse(request) {
    const url = new URL(request.url);
    
    if (isHTMLPage(request.url)) {
        // Return offline page for HTML requests
        return new Response(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Offline - IVMS</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        text-align: center; 
                        padding: 50px; 
                        background: #f8f9fa;
                        color: #333;
                    }
                    .container {
                        max-width: 500px;
                        margin: 0 auto;
                        background: white;
                        padding: 2rem;
                        border-radius: 10px;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    }
                    .icon { font-size: 4rem; margin-bottom: 1rem; }
                    h1 { color: #004E98; margin-bottom: 1rem; }
                    .btn { 
                        background: #00A3A3; 
                        color: white; 
                        padding: 12px 24px; 
                        border: none; 
                        border-radius: 5px; 
                        cursor: pointer; 
                        margin-top: 1rem;
                        text-decoration: none;
                        display: inline-block;
                    }
                    .btn:hover { background: #007A7A; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="icon">📡</div>
                    <h1>You're Offline</h1>
                    <p>It looks like you're not connected to the internet. Some features may not be available.</p>
                    <p>Please check your connection and try again.</p>
                    <button class="btn" onclick="window.location.reload()">Try Again</button>
                </div>
            </body>
            </html>
        `, {
            status: 200,
            headers: { 'Content-Type': 'text/html' }
        });
    }
    
    if (url.pathname.includes('/src/images/')) {
        // Return placeholder for failed image requests
        return new Response(`
            <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
                <rect width="100%" height="100%" fill="#f0f0f0"/>
                <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="#999" font-family="sans-serif" font-size="14">Image unavailable offline</text>
            </svg>
        `, {
            status: 200,
            headers: { 'Content-Type': 'image/svg+xml' }
        });
    }
    
    // Generic fallback
    return new Response('Resource unavailable offline', {
        status: 503,
        statusText: 'Service Unavailable'
    });
}

// Background sync for form submissions
self.addEventListener('sync', (event) => {
    if (event.tag === 'contact-form-sync') {
        event.waitUntil(syncContactForms());
    }
});

async function syncContactForms() {
    // Handle offline form submissions when back online
    const cache = await caches.open('pending-forms');
    const requests = await cache.keys();
    
    for (const request of requests) {
        try {
            await fetch(request);
            await cache.delete(request);
        } catch (error) {
            // Keep in cache for next sync attempt
        }
    }
}

// Push notifications (if implemented later)
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/src/images/ivms-logo.png',
            badge: '/src/images/ivms-logo.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: data.primaryKey || 1
            },
            actions: [
                {
                    action: 'explore',
                    title: 'Learn More',
                    icon: '/src/images/ivms-logo.png'
                },
                {
                    action: 'close',
                    title: 'Close',
                    icon: '/src/images/ivms-logo.png'
                }
            ]
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Performance monitoring
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_CACHE_SIZE') {
        getCacheSize().then(size => {
            event.ports[0].postMessage({ cacheSize: size });
        });
    }
});

async function getCacheSize() {
    const cacheNames = await caches.keys();
    let totalSize = 0;
    
    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        totalSize += keys.length;
    }
    
    return totalSize;
}