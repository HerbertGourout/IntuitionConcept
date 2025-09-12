const CACHE_NAME = 'btp-manager-v2';
const STATIC_CACHE = 'btp-static-v2';
const DYNAMIC_CACHE = 'btp-dynamic-v2';
const API_CACHE = 'btp-api-v2';

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/static/js/bundle.js',
  '/static/css/main.css',
  // Assets critiques pour le fonctionnement hors-ligne
  '/src/main.tsx',
  '/src/App.tsx'
];

// Installation du service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Activation du service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interception des requêtes avec stratégie avancée
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-HTTP/HTTPS
  if (!request.url.startsWith('http')) {
    return;
  }

  // Stratégie Cache First pour les assets statiques
  if (request.destination === 'script' || request.destination === 'style' || request.destination === 'image') {
    event.respondWith(
      caches.open(STATIC_CACHE).then(cache => {
        return cache.match(request).then(response => {
          return response || fetch(request).then(fetchResponse => {
            if (fetchResponse.ok) {
              cache.put(request, fetchResponse.clone());
            }
            return fetchResponse;
          }).catch(error => {
            console.warn('Failed to fetch static asset:', request.url, error);
            // Retourner une réponse vide plutôt que de faire échouer la requête
            return new Response('', { status: 200, statusText: 'OK' });
          });
        });
      }).catch(error => {
        console.warn('Cache error for static asset:', error);
        return fetch(request);
      })
    );
    return;
  }

  // Stratégie Network First pour les API Firebase - avec gestion d'erreur améliorée
  if (url.hostname.includes('firestore.googleapis.com') || url.hostname.includes('firebase')) {
    // Ne pas intercepter les requêtes POST/PUT/DELETE - elles ne peuvent pas être mises en cache
    if (request.method !== 'GET') {
      return;
    }
    
    event.respondWith(
      fetch(request).then(response => {
        if (response.ok && request.method === 'GET') {
          caches.open(API_CACHE).then(cache => {
            cache.put(request, response.clone()).catch(error => {
              console.warn('Failed to cache Firebase response:', error);
            });
          });
        }
        return response;
      }).catch(error => {
        console.warn('Firebase request failed, trying cache:', request.url, error);
        return caches.open(API_CACHE).then(cache => {
          return cache.match(request).then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Si pas de cache, laisser l'erreur remonter naturellement
            throw error;
          });
        });
      })
    );
    return;
  }

  // Pour les modules dynamiques et autres ressources, utiliser une approche plus permissive
  if (url.pathname.includes('.tsx') || url.pathname.includes('.ts') || url.pathname.includes('/src/')) {
    event.respondWith(
      fetch(request).catch(error => {
        console.warn('Failed to fetch module:', request.url, error);
        // Laisser l'erreur remonter pour les modules critiques
        throw error;
      })
    );
    return;
  }

  // Stratégie Stale While Revalidate pour les pages
  event.respondWith(
    caches.open(DYNAMIC_CACHE).then(cache => {
      return cache.match(request).then(response => {
        const fetchPromise = fetch(request).then(fetchResponse => {
          if (fetchResponse.ok) {
            cache.put(request, fetchResponse.clone()).catch(error => {
              console.warn('Failed to cache response:', error);
            });
          }
          return fetchResponse;
        }).catch(error => {
          console.warn('Network request failed:', request.url, error);
          if (response) {
            return response; // Retourner la version en cache si disponible
          }
          throw error; // Sinon laisser l'erreur remonter
        });
        return response || fetchPromise;
      });
    }).catch(error => {
      console.warn('Cache operation failed:', error);
      return fetch(request);
    })
  );
});

// Gestion des notifications push
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nouvelle notification IntuitionBTP',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('IntuitionConcept BTP', options)
  );
});

// Gestion des clics sur notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});
