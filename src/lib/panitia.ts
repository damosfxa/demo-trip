"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import type { Absen, Agenda, PesanPribadi, Pengumuman, Peserta, Trip } from "./types";

export type Peran = "owner" | "viewer" | null;

/** Sesi login panitia + perannya. undefined = sedang memeriksa. */
export function useSesi() {
  const [sesi, setSesi] = useState<Session | null | undefined>(undefined);
  const [peran, setPeran] = useState<Peran | undefined>(undefined);

  useEffect(() => {
    let aktif = true;
    const cekPeran = async (s: Session | null) => {
      if (!s) return setPeran(null);
      const { data } = await supabase.from("staff").select("role").eq("user_id", s.user.id).maybeSingle();
      if (aktif) setPeran((data?.role as Peran) ?? null);
    };
    supabase.auth.getSession().then(({ data }) => {
      if (!aktif) return;
      setSesi(data.session);
      cekPeran(data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSesi(s);
      cekPeran(s);
    });
    return () => {
      aktif = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { sesi, peran };
}

export type DataTrip = { trip: Trip; agenda: Agenda[]; pengumuman: Pengumuman[]; peserta: Peserta[]; absen: Absen[]; pesan: PesanPribadi[]; notifAktif: number };

export async function muatDataTrip(id: string): Promise<DataTrip> {
  const [t, a, n, p, c, m, j] = await Promise.all([
    supabase.from("trips").select("*").eq("id", id).single(),
    supabase.from("agenda").select("*").eq("trip_id", id).order("mulai"),
    supabase.from("announcements").select("*").eq("trip_id", id).order("created_at", { ascending: false }),
    supabase.from("participants").select("id, trip_id, nama, departemen, hp, bus, kamar, catatan, isian, created_at").eq("trip_id", id).order("nama"),
    supabase.from("checkins").select("*").eq("trip_id", id).order("created_at", { ascending: false }),
    supabase.from("pesan_pribadi").select("*").eq("trip_id", id).order("created_at", { ascending: false }),
    supabase.rpc("jumlah_langganan", { p_trip: id }),
  ]);
  for (const r of [t, a, n, p, c, m]) if (r.error) throw r.error;
  return {
    trip: t.data as Trip,
    agenda: a.data as Agenda[],
    pengumuman: n.data as Pengumuman[],
    peserta: p.data as Peserta[],
    absen: c.data as Absen[],
    pesan: m.data as PesanPribadi[],
    notifAktif: (j.data as number) ?? 0,
  };
}

/** Link peserta untuk sebuah trip, mengikuti alamat aplikasi saat ini. */
export const linkPeserta = (slug: string) => `${window.location.origin}/?t=${slug}`;

export function unduhCsv(nama: string, baris: (string | number | null)[][]) {
  const csv = baris.map((b) => b.map((x) => `"${String(x ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = nama;
  a.click();
  URL.revokeObjectURL(url);
}

export const slugDari = (t: string) =>
  t.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);

/** Kirim notifikasi HP lewat Edge Function kirim-kabar. Mengembalikan jumlah HP yang menerima. */
export async function kirimNotifikasi(isi: { trip_id: string; participant_id?: string | null; judul: string; isi: string; url: string }) {
  const { data, error } = await supabase.functions.invoke("kirim-kabar", { body: isi });
  if (error) throw error;
  return data as { terkirim: number; total: number };
}
