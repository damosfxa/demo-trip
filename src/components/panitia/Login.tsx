"use client";

import { useState } from "react";
import Link from "next/link";
import { pesanError, supabase } from "@/lib/supabase";
import { Kartu, Label, field, tombol } from "./ui";

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
    <div className="space-y-5 px-4 pt-10">
      <div className="text-center">
        <p className="text-4xl">🧳</p>
        <h1 className="mt-2 text-2xl font-extrabold">Panel panitia</h1>
        <p className="text-sm text-slate-500">Kelola peserta, jadwal, pengumuman, dan absensi.</p>
      </div>
      <Kartu>
        <form onSubmit={masuk} className="space-y-4">
          <Label teks="Email">
            <input className={field} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
          </Label>
          <Label teks="Password">
            <input className={field} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </Label>
          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <button disabled={proses} className={`${tombol} w-full py-3`}>{proses ? "Masuk..." : "Masuk"}</button>
        </form>
      </Kartu>
      <p className="text-center text-sm"><Link href="/" className="font-semibold text-sky-700">Kembali</Link></p>
    </div>
  );
}
