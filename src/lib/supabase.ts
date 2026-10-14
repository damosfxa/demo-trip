import { createClient } from "@supabase/supabase-js";

// Kunci publik (anon/publishable). Aman berada di browser karena semua akses dijaga RLS di database.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const siap = Boolean(url && key);

export const supabase = createClient(url || "https://belum-diisi.supabase.co", key || "belum-diisi", {
  auth: { persistSession: true, autoRefreshToken: true },
});

/** Pesan error Supabase/Postgres jadi kalimat yang ramah. */
export function pesanError(e: unknown) {
  const m = e && typeof e === "object" && "message" in e ? String((e as { message: unknown }).message) : String(e);
  if (/Failed to fetch|NetworkError|fetch failed/i.test(m)) return "Tidak ada koneksi internet. Coba lagi sebentar.";
  if (/Invalid login credentials/i.test(m)) return "Email atau password salah.";
  if (/row-level security|permission denied/i.test(m)) return "Akun ini tidak punya izin untuk melakukan itu.";
  if (/duplicate key.*checkins/i.test(m)) return "Peserta ini sudah diabsen di titik tersebut.";
  if (/duplicate key.*slug/i.test(m)) return "Kode link sudah dipakai trip lain.";
  return m;
}
