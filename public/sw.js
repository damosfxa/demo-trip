// Service worker Info Trip: halaman dan file aplikasi disimpan, jadi tetap terbuka tanpa sinyal,
// dan menampilkan notifikasi HP dari panitia. Permintaan ke Supabase tidak disentuh di sini.
const CACHE = "infotrip-v2";

// Simpan kerangka aplikasi sejak awal, supaya pembukaan pertama dari layar utama tetap jalan tanpa sinyal.
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(["/", "/icon-192.png", "/icon-512.png"]))
      .catch(() => {}),
  );
  self.skipWaiting();
});
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

// Notifikasi dari panitia (dikirim lewat Edge Function kirim-kabar).
self.addEventListener("push", (e) => {
  let data = { judul: "Info Trip", isi: "Ada kabar baru dari panitia.", url: "/" };
  try {
    data = { ...data, ...e.data.json() };
  } catch {}
  e.waitUntil(
    self.registration.showNotification(data.judul, {
      body: data.isi,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: data.url },
      tag: "infotrip-" + Date.now(),
    }),
  );
});

// Ketuk notifikasi: buka aplikasi (pakai tab yang sudah terbuka bila ada).
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const tujuan = (e.notification.data && e.notification.data.url) || "/";
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if (new URL(c.url).search === new URL(tujuan, self.location.origin).search) return c.focus();
      }
      return self.clients.openWindow(tujuan);
    }),
  );
});
