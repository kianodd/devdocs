// DevDocs service worker v2 — shell cache is versioned; offline downloads and
// translations live in their own caches that survive app updates.
const VERSION = 'devdocs-shell-v17';
const RUNTIME = 'devdocs-runtime-v17';
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
  if (!e.data) return;
  if (e.data.type === 'SKIP_WAITING') self.skipWaiting();
  if (e.data.type === 'UPDATE_SHELL') {
    // Refetch the shell straight from the network so an update applies even
    // while this worker's own script is still HTTP-cached somewhere.
    e.waitUntil((async () => {
      try {
        const c = await caches.open(VERSION);
        await Promise.all(SHELL.map(async (u) => {
          try { const r = await fetch(u, { cache: 'no-store' }); if (r.ok) await c.put(u, r); } catch {}
        }));
        const rc = await caches.open(RUNTIME);
        await rc.delete('data/catalog.json').catch(() => {});
        try { const r = await fetch('data/catalog.json', { cache: 'no-store' }); if (r.ok) await rc.put('data/catalog.json', r); } catch {}
      } catch {}
      const clients = await self.clients.matchAll({ includeUncontrolled: true });
      clients.forEach((cl) => cl.postMessage({ type: 'SHELL_UPDATED' }));
    })());
  }
});

// Shell files are network-first so a new release applies on the next load
// even before this worker itself gets replaced; content stays cache-first.
const NETWORK_FIRST = [/\/$/, /index\.html$/, /app\.js$/, /styles\.css$/, /manifest\.webmanifest$/, /data\/catalog\.json$/];

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.endsWith('version.json')) return; // always network
  if (NETWORK_FIRST.some((re) => re.test(url.pathname))) {
    e.respondWith(
      fetch(request).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(request, copy));
        }
        return res;
      }).catch(() => caches.match(request, { ignoreSearch: true }).then((hit) => hit || (request.mode === 'navigate' ? caches.match('index.html') : new Response('', { status: 504 }))))
    );
    return;
  }
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
