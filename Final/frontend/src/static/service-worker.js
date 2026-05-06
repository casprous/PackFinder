const CACHE_NAME = 'packfinder-v6';

const STATIC_ASSETS = [
  '/',
  '/home.html',
  '/login.html',
  '/forum.html',
  '/profile.html',
  '/map.html',
  '/post.html',
  '/notifications.html',
  '/offline.html',
  '/css/styles.css',
  '/css/navStyle.css',
  '/css/homeStyle.css',
  '/css/loginStyle.css',
  '/css/mapStyle.css',
  '/css/forumStyle.css',
  '/css/postStyle.css',
  '/css/profileStyle.css',
  '/icons/logo.svg',
  '/js/idb.js', 
  '/js/menu.js',
  '/js/login.js',
  '/js/home.js',
  '/js/forum.js',
  '/js/map.js',
  '/js/post.js',
  '/js/profile.js',
  '/js/notifications.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('Service Worker: Caching App Shell...');
      for (let asset of STATIC_ASSETS) {
        try {
          await cache.add(asset);
        } catch (e) {
          console.log(`[SW] Failed to cache ${asset}`);
        }
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) return caches.delete(cache);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const request = event.request;

  // Let the browser natively handle POST, PUT, DELETE
  if (request.method !== 'GET') {
    return; // Do nothing. Let the browser handle the network failure naturally.
  }

  // Let IndexedDB handle the API data
  if (request.url.includes('/api/')) {
    return; // Do nothing. Let the browser handle it.
  }

  // HTML Navigation Strategy
  if (request.headers.get('accept') && request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match(request))
        .then(response => response || caches.match('/offline.html'))
    );
    return;
  }

  // Static Assets Strategy
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      return cachedResponse || fetch(request).then(response => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(request, response.clone());
          return response;
        });
      });
    })
  );
});

// Listen for incoming push messages from the server
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.body || 'You have a new notification.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png', // Small monochrome icon for Android status bar
    data: { url: data.url || '/notifications.html' },
    vibrate: [100, 50, 100]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'PackFinder', options)
  );
});

// Handle what happens when the user taps the notification banner
self.addEventListener('notificationclick', event => {
  event.notification.close();
  // Open the specific post URL attached to the notification data
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});