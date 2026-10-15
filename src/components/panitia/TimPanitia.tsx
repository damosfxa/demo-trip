"use client";

import { useEffect, useState } from "react";
import { pesanError, supabase } from "@/lib/supabase";
import { Kartu, field, tombol } from "./ui";

/** Owner cukup mengisi email. Sistem membuat akun, mengirim tautan masuk ke email itu, dan langsung memberi perannya. */
export function TimPanitia() {
  const [daftar, setDaftar] = useState<{ email: string; peran: string }[] | null>(null);
  const [email, setEmail] = useState("");
  const [peran, setPeran] = useState<"owner" | "viewer">("viewer");
  const [info, setInfo] = useState<string | null>(null);
  const [proses, setProses] = useState(false);
  const [muat, setMuat] = useState(0);

  useEffect(() => {
    let aktif = true;
    supabase.rpc("daftar_staff").then(({ data, error }) => {
      if (!aktif) return;
      if (error) return setDaftar([]);
      setDaftar((data ?? []) as { email: string; peran: string }[]);
    });
    return () => {
      aktif = false;
    };
  }, [muat]);

  const undang = async () => {
    const alamat = email.trim().toLowerCase();
    if (!alamat) return setInfo("Isi email panitia.");
    setProses(true);
    setInfo(null);
    // 1. Buat akun dan kirim tautan masuk ke email. Peserta tidak perlu membuat password.
    const { error: e1 } = await supabase.auth.signInWithOtp({
      email: alamat,
      options: { shouldCreateUser: true, emailRedirectTo: `${window.location.origin}/panitia/` },
    });
    if (e1) {
      setProses(false);
      return setInfo(pesanError(e1));
    }
    // 2. Berikan peran panitia.
    const { data, error: e2 } = await supabase.rpc("tambah_staff", { p_email: alamat, p_role: peran });
    setProses(false);
    if (e2) return setInfo(pesanError(e2));
    setInfo(`Undangan dikirim ke ${alamat}. ${String(data)} Mereka cukup membuka tautan di email dan langsung masuk.`);
    setEmail("");
    setMuat((x) => x + 1);
  };

  return (
    <Kartu className="space-y-3">
      <p className="font-bold">Tim panitia</p>
      <p className="text-sm text-slate-500">Isi email panitia, lalu pilih perannya. Mereka akan menerima tautan masuk di email, tanpa perlu membuat password.</p>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <input className={field} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@gmail.com" type="email" />
        <select className={field} value={peran} onChange={(e) => setPeran(e.target.value as "owner" | "viewer")}>
          <option value="viewer">Lihat saja</option>
          <option value="owner">Bisa mengubah</option>
        </select>
      </div>
      <button onClick={undang} disabled={proses} className={`${tombol} w-full`}>{proses ? "Mengirim undangan..." : "Kirim undangan"}</button>
      {info && <p className="rounded-xl bg-laut-50 px-3 py-2 text-sm text-laut-900">{info}</p>}
      <ul className="divide-y divide-slate-100">
        {(daftar ?? []).map((p) => (
          <li key={p.email} className="flex justify-between py-2 text-sm">
            <span className="truncate">{p.email}</span>
            <span className="font-semibold text-slate-500">{p.peran === "owner" ? "Bisa mengubah" : "Lihat saja"}</span>
          </li>
        ))}
      </ul>
    </Kartu>
  );
}
