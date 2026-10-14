import { pesanError, supabase } from "./supabase";
import { baca, tulis } from "./simpan";
import type { Agenda, DataSaya, Pengumuman, Trip } from "./types";

// Data untuk sisi peserta. Setiap hasil disalin ke localStorage, jadi halaman tetap bisa dibuka
// tanpa sinyal (misalnya di pesawat atau di lokasi wisata) dengan data terakhir.

export const kunciToken = (slug: string) => `infotrip:token:${slug}`;
export const kunciCek = (slug: string) => `infotrip:cek:${slug}`;
const kunciTrip = (slug: string) => `infotrip:trip:${slug}`;
const kunciSaya = (slug: string) => `infotrip:saya:${slug}`;

export type PaketTrip = { trip: Trip; agenda: Agenda[]; pengumuman: Pengumuman[]; diambil: string };
export type Hasil<T> = { data: T | null; offline: boolean; error: string | null };

export async function muatTrip(slug: string): Promise<Hasil<PaketTrip>> {
  try {
    const { data: trip, error } = await supabase.from("trips").select("*").eq("slug", slug).maybeSingle();
    if (error) throw error;
    if (!trip) return { data: null, offline: false, error: "Trip tidak ditemukan atau sudah ditutup." };
    const [agenda, pengumuman] = await Promise.all([
      supabase.from("agenda").select("*").eq("trip_id", trip.id).order("mulai"),
      supabase.from("announcements").select("*").eq("trip_id", trip.id).order("created_at", { ascending: false }),
    ]);
    if (agenda.error) throw agenda.error;
    if (pengumuman.error) throw pengumuman.error;
    const paket: PaketTrip = { trip: trip as Trip, agenda: agenda.data as Agenda[], pengumuman: pengumuman.data as Pengumuman[], diambil: new Date().toISOString() };
    tulis(kunciTrip(slug), paket);
    return { data: paket, offline: false, error: null };
  } catch (e) {
    const simpanan = baca<PaketTrip>(kunciTrip(slug));
    return { data: simpanan, offline: !!simpanan, error: simpanan ? null : pesanError(e) };
  }
}

export async function muatSaya(slug: string, token: string): Promise<Hasil<DataSaya>> {
  try {
    const { data, error } = await supabase.rpc("data_saya", { p_token: token });
    if (error) throw error;
    if (!data) return { data: null, offline: false, error: null };
    tulis(kunciSaya(slug), data);
    return { data: data as DataSaya, offline: false, error: null };
  } catch (e) {
    const simpanan = baca<DataSaya>(kunciSaya(slug));
    return { data: simpanan, offline: !!simpanan, error: simpanan ? null : pesanError(e) };
  }
}

export async function daftar(slug: string, nama: string, departemen: string, hp: string, isian: Record<string, string> = {}) {
  const { data, error } = await supabase.rpc("daftar_peserta", { p_slug: slug, p_nama: nama, p_departemen: departemen, p_hp: hp, p_isian: isian });
  if (error) throw new Error(pesanError(error));
  return data as string;
}

/** Simpan token peserta di HP ini (setelah registrasi berhasil). */
export function simpanToken(slug: string, token: string) {
  tulis(kunciToken(slug), token);
}

export function keluar(slug: string) {
  tulis(kunciToken(slug), null);
  tulis(kunciSaya(slug), null);
}
