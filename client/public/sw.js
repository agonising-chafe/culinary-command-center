const CACHE = 'ccc-shell-v1'
const ASSETS = ['/', '/index.html', '/manifest.json']

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (e) => {
  const { request } = e

  // Only handle same-origin requests
  const sameOrigin = new URL(request.url).origin === self.location.origin
  if (!sameOrigin) return

  const url = new URL(request.url)

  // Ignore Vite HMR and module graph paths
  if (
    url.pathname.startsWith('/@vite') ||
    url.pathname.startsWith('/@react-refresh') ||
    url.pathname.startsWith('/src/')
  ) {
    return
  }

  // Network-first for navigation requests
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    )
    return
  }

  // Cache-first for other same-origin assets
  e.respondWith(
    caches.match(request).then(cached => cached || fetch(request))
  )
})
