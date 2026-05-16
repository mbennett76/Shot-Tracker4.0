const CACHE = 'shottracker-v4';
const BASE = '/Shot-tracker4.0/';
const ASSETS = [
  BASE,
  BASE + 'index.html',
  BASE + 'manifest.json',
  BASE + 'icon-192.png'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(c) { return c.addAll(ASSETS); })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request).then(function(response) {
        if (!response || response.status !== 200 || response.type !== 'basic') return response;
        var clone = response.clone();
        caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
        return response;
      });
    }).catch(function() {
      return caches.match(BASE + 'index.html');
    })
  );
});
