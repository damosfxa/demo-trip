// Service worker Info Trip: halaman dan file aplikasi disimpan, jadi tetap terbuka tanpa sinyal.
// Data trip sendiri disimpan aplikasi di localStorage. Permintaan ke Supabase tidak disentuh di sini.
const CACHE = "infotrip-v1";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin) return;
  // Utamakan jaringan (selalu versi terbaru), pakai simpanan bila offline.
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const salin = res.clone();
          caches.open(CACHE).then((c) => c.put(req, salin));
        }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match("/"))),
  );
});
