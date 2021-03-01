self.addEventListener('install', (e) => {
    e.waitUntil(
      caches.open('mrbs-store').then((cache) => cache.addAll([
        'mrbs-modern-pwa-index.html',
      ])),
    );
  });
  
  self.addEventListener('fetch', (e) => {
    console.log(e.request.url);
    e.respondWith(
      caches.match(e.request).then((response) => response || fetch(e.request)),
    );
  });