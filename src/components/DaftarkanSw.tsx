"use client";

import { useEffect } from "react";

/**
 * Daftarkan service worker supaya aplikasi tetap terbuka saat sinyal hilang.
 * Kalau ada versi baru, halaman langsung dimuat ulang dengan versi terbaru. Peserta tidak perlu melakukan apa-apa.
 */
export function DaftarkanSw() {
  // Safari iPhone mengabaikan user-scalable=no, jadi gerakan cubit untuk zoom dicegah di sini.
  useEffect(() => {
    const cegahZoom = (e: Event) => e.preventDefault();
    document.addEventListener("gesturestart", cegahZoom);
    document.addEventListener("gesturechange", cegahZoom);
    return () => {
      document.removeEventListener("gesturestart", cegahZoom);
      document.removeEventListener("gesturechange", cegahZoom);
    };
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !(location.protocol === "https:" || location.hostname === "localhost")) return;
    let reg: ServiceWorkerRegistration | null = null;

    navigator.serviceWorker.register("/sw.js").then((r) => {
      reg = r;
      r.addEventListener("updatefound", () => {
        const baru = r.installing;
        baru?.addEventListener("statechange", () => {
          // Versi baru sudah terpasang dan sudah melayani halaman ini: muat ulang sekali untuk memakai versi terbaru.
          if (baru.state === "installed" && navigator.serviceWorker.controller) {
            window.location.reload();
          }
        });
      });
    }).catch(() => {});

    // Cek pembaruan setiap kali aplikasi kembali dibuka dari latar belakang.
    const saatKembali = () => document.visibilityState === "visible" && reg?.update().catch(() => {});
    document.addEventListener("visibilitychange", saatKembali);
    return () => document.removeEventListener("visibilitychange", saatKembali);
  }, []);

  return null;
}
