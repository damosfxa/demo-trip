"use client";

import { supabase } from "./supabase";

// Notifikasi HP (Web Push). Peserta mengizinkan sekali, lalu panitia bisa mengirim kabar
// walaupun aplikasi sedang tertutup.

export type StatusNotif = "tidak-didukung" | "perlu-dipasang" | "belum" | "ditolak" | "aktif";

const iOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
const terpasang = () => window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;

export async function statusNotifikasi(): Promise<StatusNotif> {
  if (!("serviceWorker" in navigator)) return "tidak-didukung";
  // Di iPhone, notifikasi web hanya jalan bila aplikasi sudah ditambahkan ke layar utama.
  if (iOS() && !terpasang()) return "perlu-dipasang";
  if (!("PushManager" in window) || !("Notification" in window)) return "tidak-didukung";
  if (Notification.permission === "denied") return "ditolak";
  if (Notification.permission !== "granted") return "belum";
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  return sub ? "aktif" : "belum";
}

function keUint8(base64url: string) {
  const pad = "=".repeat((4 - (base64url.length % 4)) % 4);
  const raw = atob((base64url + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

/** Minta izin, berlangganan, dan simpan langganan ke database. */
export async function aktifkanNotifikasi(token: string): Promise<StatusNotif> {
  const izin = await Notification.requestPermission();
  if (izin !== "granted") return izin === "denied" ? "ditolak" : "belum";

  const { data: kunci, error } = await supabase.rpc("kunci_publik_notifikasi");
  if (error || !kunci) throw new Error("Notifikasi belum bisa diaktifkan. Coba lagi nanti.");

  const reg = (await navigator.serviceWorker.getRegistration()) ?? (await navigator.serviceWorker.register("/sw.js"));
  await navigator.serviceWorker.ready;
  const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keUint8(kunci as string) }));
  const json = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
  const { error: errSimpan } = await supabase.rpc("simpan_langganan", { p_token: token, p_endpoint: json.endpoint, p_p256dh: json.keys.p256dh, p_auth: json.keys.auth });
  if (errSimpan) throw new Error("Gagal menyimpan pengaturan notifikasi.");
  return "aktif";
}
