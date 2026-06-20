// FinanzHome Service Worker v2 - Network first, no cache issues
const CACHE_NAME = 'finanzapp-v2';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  // Delete ALL old caches
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Network ALWAYS first - never serve stale cache
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('supabase.co')) return;
  if (e.request.url.includes('anthropic.com')) return;
  if (e.request.url.includes('googleapis.com')) return;
  if (e.request.url.includes('fonts.g')) return;

  e.respondWith(
    fetch(e.request)
      .then(res => res)
      .catch(() => caches.match(e.request))
  );
});
