"use client";

import { useState } from "react";
import Link from "next/link";
import { pesanError, supabase } from "@/lib/supabase";
import { Pemandangan } from "../Pemandangan";
import { Label, field, tombol } from "./ui";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [proses, setProses] = useState(false);

  const masuk = async (e: React.FormEvent) => {
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
      <form onSubmit={masuk} className="relative -mt-7 mx-4 space-y-4 rounded-[2rem] bg-white p-5 shadow-[0_20px_40px_-20px_rgba(6,42,61,0.4)] ring-1 ring-black/5">
        <p className="text-sm text-slate-500">Kelola peserta, jadwal, pengumuman, dan absensi.</p>
        <Label teks="Email">
          <input className={field} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
        </Label>
        <Label teks="Password">
          <input className={field} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </Label>
        {error && <p className="anim-naik rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}
        <button disabled={proses} className={`${tombol} w-full py-3.5`}>{proses ? "Masuk..." : "Masuk"}</button>
      </form>
      <p className="mt-5 text-center text-sm"><Link href="/" className="font-semibold text-laut-700">Kembali</Link></p>
    </div>
  );
}
