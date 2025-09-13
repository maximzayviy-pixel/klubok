// Workbox SW — кэшируем только same-origin, не трогаем чужие CDN (Twilio, Tailwind)
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
workbox.core.clientsClaim();

const isSameOrigin = ({url}) => url.origin === self.location.origin;

// Кэшируем ТОЛЬКО свои документы/скрипты/стили
workbox.routing.registerRoute(
  ({request, url}) => isSameOrigin({url}) &&
    (request.destination === 'document' || request.destination === 'script' || request.destination === 'style'),
  new workbox.strategies.StaleWhileRevalidate({ cacheName: 'app-shell' })
);

// Кэш картинок: тоже только свои
workbox.routing.registerRoute(
  ({request, url}) => isSameOrigin({url}) && request.destination === 'image',
  new workbox.strategies.CacheFirst({
    cacheName: 'images',
    plugins: [new workbox.expiration.ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 60*60*24*30 })]
  })
);

// Ничего не перехватываем у сторонних доменов.
// Оффлайн-фоллбек для документов:
workbox.routing.setCatchHandler(async (context) => {
  if (context.event.request.destination === 'document') {
    return Response.redirect('/');
  }
  return Response.error();
});
