// Service Worker for Weather App

const CACHE_NAME = "weather-app-v1"
const OFFLINE_URL = "/offline"

// Assets to cache
const ASSETS_TO_CACHE = [
  "/",
  "/offline",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/favicon.ico",
]

// Install event - cache assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE)
      })
      .then(() => {
        return self.skipWaiting()
      }),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        return self.clients.claim()
      }),
  )
})

// Fetch event - serve from cache or network
self.addEventListener("fetch", (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return
  }

  // Handle API requests differently
  if (
    event.request.url.includes("/api/") ||
    event.request.url.includes("open-meteo.com") ||
    event.request.url.includes("geocoding-api")
  ) {
    // Network first, then cache for API requests
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the response for future use
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone)
          })
          return response
        })
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse
            }
            // If not in cache, return offline page
            return caches.match(OFFLINE_URL)
          })
        }),
    )
  } else {
    // Cache first, then network for static assets
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse
        }

        return fetch(event.request)
          .then((response) => {
            // Cache the response for future use
            const responseClone = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone)
            })
            return response
          })
          .catch(() => {
            // If both cache and network fail, serve offline page
            if (event.request.mode === "navigate") {
              return caches.match(OFFLINE_URL)
            }
            // Return a placeholder image for image requests
            if (event.request.destination === "image") {
              return new Response(
                '<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#eee"/><text x="200" y="150" font-family="Arial" font-size="20" text-anchor="middle" fill="#888">Image Offline</text></svg>',
                { headers: { "Content-Type": "image/svg+xml" } },
              )
            }
            return new Response("Content not available offline", {
              status: 503,
              statusText: "Service Unavailable",
              headers: new Headers({
                "Content-Type": "text/plain",
              }),
            })
          })
      }),
    )
  }
})

// Handle push notifications
self.addEventListener("push", (event) => {
  const data = event.data.json()
  const options = {
    body: data.body,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: {
      url: data.url || "/",
    },
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  event.waitUntil(clients.openWindow(event.notification.data.url))
})
