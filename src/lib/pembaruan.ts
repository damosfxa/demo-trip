/**
 * Memperbarui aplikasi dari dalam: minta service worker memeriksa versi terbaru, hapus salinan lama,
 * lalu muat ulang. Tidak perlu membuka browser atau memasang ulang.
 */
export async function perbaruiAplikasi() {
  try {
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.update().catch(() => {})));
    }
    if ("caches" in window) {
      for (const k of await caches.keys()) await caches.delete(k);
    }
  } finally {
    window.location.reload();
  }
}
