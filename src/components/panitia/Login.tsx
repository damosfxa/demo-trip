"use client";

import { useState } from "react";
import Link from "next/link";
import { pesanError, supabase } from "@/lib/supabase";
import { Pemandangan } from "../Pemandangan";
import { Label, field, tombol, tombolGaris } from "./ui";

/** Alamat tujuan setelah tautan di email dibuka. Harus sama dengan yang diizinkan di pengaturan Supabase. */
const tujuanTautan = () => `${window.location.origin}/panitia/`;

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tampilPassword, setTampilPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kabar, setKabar] = useState<string | null>(null);
  const [proses, setProses] = useState(false);

  // Cara utama: tautan masuk dikirim ke email. Tidak perlu password.
  const kirimTautan = async () => {
    setError(null);
    setKabar(null);
    if (!email.trim()) return setError("Isi email Anda dulu.");
    setProses(true);
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: tujuanTautan(), shouldCreateUser: false },
    });
    setProses(false);
    if (err) return setError(pesanError(err));
    setKabar("Tautan masuk sudah dikirim ke email Anda. Buka email itu di HP atau laptop ini, lalu ketuk tautannya.");
  };

  const masukPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setProses(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (err) setError(pesanError(err));
    setProses(false);
  };

  return (
    <div className="pb-10">
      <div className="relative h-60 overflow-hidden bg-laut-900">
        <Pemandangan suasana="senja" className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-laut-950/35" />
        <div className="relative flex h-full flex-col justify-end px-6 pb-12 text-white">
          <p className="text-sm font-semibold text-mentari-400">Info Trip</p>
          <h1 className="text-3xl font-extrabold tracking-tight">Panel panitia</h1>
        </div>
      </div>
      <div className="relative -mt-7 mx-4 space-y-4 rounded-[2rem] bg-white p-5 shadow-[0_20px_40px_-20px_rgba(6,42,61,0.4)] ring-1 ring-black/5">
        <p className="text-sm text-slate-500">Kelola peserta, jadwal, pengumuman, dan absensi.</p>
        <Label teks="Email">
          <input className={field} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" placeholder="nama@gmail.com" />
        </Label>
        {error && <p className="anim-naik rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}
        {kabar && <p className="anim-naik rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{kabar}</p>}
        <button type="button" onClick={kirimTautan} disabled={proses} className={`${tombol} w-full py-3.5`}>
          {proses ? "Mengirim..." : "Kirim tautan masuk ke email"}
        </button>

        <div className="pt-1 text-center">
          <button type="button" onClick={() => setTampilPassword((t) => !t)} className="text-sm font-semibold text-slate-500">
            {tampilPassword ? "Tutup masuk dengan password" : "Masuk dengan password"}
          </button>
        </div>
        {tampilPassword && (
          <form onSubmit={masukPassword} className="space-y-3">
            <Label teks="Password">
              <input className={field} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            </Label>
            <button disabled={proses} className={`${tombolGaris} w-full`}>{proses ? "Masuk..." : "Masuk"}</button>
          </form>
        )}
      </div>
      <p className="mt-5 text-center text-sm"><Link href="/" className="font-semibold text-laut-700">Kembali</Link></p>
    </div>
  );
}
