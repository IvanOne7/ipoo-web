// Service worker mínimo para que iPoo sea instalable como PWA
const CACHE = "ipoo-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

// Estrategia: red primero, sin cachear (la app necesita datos frescos)
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});