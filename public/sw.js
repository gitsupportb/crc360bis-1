const CACHE_NAME = 'crc360-v1.0.0'
const STATIC_CACHE_NAME = 'crc360-static-v1.0.0'
const RUNTIME_CACHE_NAME = 'crc360-runtime-v1.0.0'

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/_next/static/css/_app-client.css',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Add more static assets as needed
]

// Runtime caching patterns
const RUNTIME_CACHE_PATTERNS = [
  // API endpoints
  { pattern: /^https?:\/\/.*\/api\/.*$/, strategy: 'networkFirst' },
  // Images
  { pattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/, strategy: 'cacheFirst' },
  // Fonts
  { pattern: /\.(?:woff|woff2|ttf|eot)$/, strategy: 'cacheFirst' },
  // Next.js static files
  { pattern: /\/_next\/static\/.*/, strategy: 'cacheFirst' },
  // HTML pages
  { pattern: /.*\.html$/, strategy: 'networkFirst' },
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...')
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('[SW] Caching static assets')
        return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { credentials: 'same-origin' })))
      })
    ]).then(() => {
      console.log('[SW] Service worker installed successfully')
      // Force activation of new service worker
      self.skipWaiting()
    }).catch((error) => {
      console.error('[SW] Service worker installation failed:', error)
    })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...')
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE_NAME && 
              cacheName !== RUNTIME_CACHE_NAME &&
              cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      console.log('[SW] Service worker activated successfully')
      // Take control of all clients
      return self.clients.claim()
    }).catch((error) => {
      console.error('[SW] Service worker activation failed:', error)
    })
  )
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const request = event.request
  const url = new URL(request.url)

  // Skip cross-origin requests and non-GET requests
  if (url.origin !== location.origin || request.method !== 'GET') {
    return
  }

  // Find matching cache pattern
  const cachePattern = RUNTIME_CACHE_PATTERNS.find(pattern => 
    pattern.pattern.test(request.url)
  )

  if (cachePattern) {
    event.respondWith(handleRequest(request, cachePattern.strategy))
  } else {
    // Default strategy for other requests
    event.respondWith(handleRequest(request, 'networkFirst'))
  }
})

// Handle different caching strategies
async function handleRequest(request, strategy) {
  const cache = await caches.open(RUNTIME_CACHE_NAME)

  switch (strategy) {
    case 'cacheFirst':
      return cacheFirst(request, cache)
    case 'networkFirst':
      return networkFirst(request, cache)
    case 'staleWhileRevalidate':
      return staleWhileRevalidate(request, cache)
    default:
      return networkFirst(request, cache)
  }
}

// Cache-first strategy
async function cacheFirst(request, cache) {
  try {
    const cachedResponse = await cache.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    const networkResponse = await fetch(request)
    if (networkResponse.status === 200) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.error('[SW] Cache-first strategy failed:', error)
    return caches.match('/offline.html') || new Response('Offline')
  }
}

// Network-first strategy
async function networkFirst(request, cache) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.status === 200) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.warn('[SW] Network failed, trying cache:', error.message)
    const cachedResponse = await cache.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html') || new Response('Offline')
    }
    
    throw error
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request, cache) {
  const cachedResponse = cache.match(request)
  
  const networkResponse = fetch(request).then((response) => {
    if (response.status === 200) {
      cache.put(request, response.clone())
    }
    return response
  }).catch(() => {
    // Network failed, return cached version
    return cachedResponse
  })

  return cachedResponse || networkResponse
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag)
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  console.log('[SW] Performing background sync...')
  // Implement background sync logic here
  // For example, sync offline form submissions, cache updates, etc.
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received:', event)
  
  let notificationData = {
    title: 'CRC360 Notification',
    body: 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'crc360-notification',
    requireInteraction: true
  }

  if (event.data) {
    try {
      const data = event.data.json()
      notificationData = { ...notificationData, ...data }
    } catch (error) {
      console.warn('[SW] Failed to parse push data:', error)
      notificationData.body = event.data.text()
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  )
})

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification)
  
  event.notification.close()

  const urlToOpen = event.notification.data?.url || '/'
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if any client is already open
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus()
        }
      }
      
      // Open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen)
      }
    })
  )
})

// Message handling from main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data)
  
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting()
        break
      case 'CACHE_URLS':
        event.waitUntil(cacheUrls(event.data.urls))
        break
      case 'CLEAR_CACHE':
        event.waitUntil(clearCaches())
        break
    }
  }
})

// Cache specific URLs
async function cacheUrls(urls) {
  const cache = await caches.open(RUNTIME_CACHE_NAME)
  return cache.addAll(urls.map(url => new Request(url, { credentials: 'same-origin' })))
}

// Clear all caches
async function clearCaches() {
  const cacheNames = await caches.keys()
  return Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)))
}

console.log('[SW] Service worker loaded successfully')