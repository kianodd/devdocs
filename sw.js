// DevDocs service worker v2 — shell cache is versioned; offline downloads and
// translations live in their own caches that survive app updates.
const VERSION = 'devdocs-shell-v4';
const RUNTIME = 'devdocs-runtime-v4';
const KEEP = [VERSION, RUNTIME, 'devdocs-offline-v1', 'devdocs-i18n-v1'];
const SHELL = [
  './',
  'index.html',
  'styles.css',
  'app.js',
  'manifest.webmanifest',
  'data/catalog.json',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
  'icons/favicon.png',
  'fonts/Vazirmatn-Regular.woff2',
  'fonts/Vazirmatn-Medium.woff2',
  'fonts/Vazirmatn-SemiBold.woff2',
  'fonts/Vazirmatn-Bold.woff2',
  'fonts/Manrope-Variable.woff2',
  'fonts/Inconsolata-Variable.woff2',
];

self.addEventListener('install', (e) => {
  // No skipWaiting: the app shows an update prompt first.
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !KEEP.includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.endsWith('version.json')) return; // always network
  e.respondWith(
    caches.match(request, { ignoreSearch: true }).then((hit) => {
      if (hit) return hit;
      return fetch(request).then((res) => {
        if (res.ok && (url.pathname.includes('/data/') || url.pathname.includes('/assets/') || url.pathname.includes('/fonts/'))) {
          const copy = res.clone();
          caches.open(RUNTIME).then((c) => c.put(request, copy));
        }
        return res;
      }).catch(() => {
        if (request.mode === 'navigate') return caches.match('index.html');
        return new Response('', { status: 504 });
      });
    })
  );
});
