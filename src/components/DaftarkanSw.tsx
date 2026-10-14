"use client";

import { useEffect } from "react";

/** Daftarkan service worker supaya aplikasi tetap terbuka saat sinyal hilang. */
export function DaftarkanSw() {
  useEffect(() => {
    if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}
