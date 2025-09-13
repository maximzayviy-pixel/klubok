// Workbox SW
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

workbox.core.clientsClaim();

workbox.routing.registerRoute(
  ({request}) => request.destination === 'document' || request.destination === 'script' || request.destination === 'style',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'app-shell'
  })
);

workbox.routing.registerRoute(
  ({request}) => request.destination === 'image',
  new workbox.strategies.CacheFirst({
    cacheName: 'images',
    plugins: [new workbox.expiration.ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 60*60*24*30 })]
  })
);

// fallback for offline
workbox.routing.setCatchHandler(async context => {
  if (context.event.request.destination === 'document') {
    return Response.redirect('/');
  }
  return Response.error();
});
