"use client";

import { useEffect, useState } from "react";

/**
 * Daftarkan service worker supaya aplikasi tetap terbuka saat sinyal hilang.
 * Kalau ada versi baru, muncul ajakan untuk memuat ulang. Tidak perlu pasang ulang aplikasi.
 */
export function DaftarkanSw() {
  const [ada, setAda] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !(location.protocol === "https:" || location.hostname === "localhost")) return;
    let reg: ServiceWorkerRegistration | null = null;
    const cekPembaruan = () => reg?.update().catch(() => {});

    navigator.serviceWorker.register("/sw.js").then((r) => {
      reg = r;
      r.addEventListener("updatefound", () => {
        const baru = r.installing;
        baru?.addEventListener("statechange", () => {
          // Ada versi lama yang sedang melayani halaman ini, jadi ini memang pembaruan.
          if (baru.state === "installed" && navigator.serviceWorker.controller) setAda(true);
        });
      });
    }).catch(() => {});

    // Cek pembaruan setiap kali aplikasi kembali dibuka dari latar belakang.
    const saatKembali = () => document.visibilityState === "visible" && cekPembaruan();
    document.addEventListener("visibilitychange", saatKembali);
    return () => document.removeEventListener("visibilitychange", saatKembali);
  }, []);

  if (!ada) return null;
  return (
    <div role="status" className="fixed inset-x-4 bottom-24 z-[60] mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl bg-laut-950 px-4 py-3 text-white shadow-2xl">
      <p className="text-sm font-semibold">Ada pembaruan aplikasi.</p>
      <button onClick={() => window.location.reload()} className="shrink-0 rounded-xl bg-mentari-400 px-3 py-2 text-sm font-bold text-laut-950 transition active:scale-95">
        Muat ulang
      </button>
    </div>
  );
}
