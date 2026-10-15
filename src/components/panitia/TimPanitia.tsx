"use client";

import { useEffect, useState } from "react";
import { pesanError, supabase } from "@/lib/supabase";
import { Kartu, field, tombol } from "./ui";

/** Daftar akun panitia. Owner bisa menambah akun yang sudah terdaftar di Supabase, lalu memilih perannya. */
export function TimPanitia() {
  const [daftar, setDaftar] = useState<{ email: string; peran: string }[] | null>(null);
  const [email, setEmail] = useState("");
  const [peran, setPeran] = useState<"owner" | "viewer">("owner");
  const [info, setInfo] = useState<string | null>(null);
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

  const tambah = async () => {
    if (!email.trim()) return setInfo("Isi email panitia.");
    const { data, error } = await supabase.rpc("tambah_staff", { p_email: email.trim(), p_role: peran });
    if (error) return setInfo(pesanError(error));
    setInfo(String(data));
    setEmail("");
    setMuat((x) => x + 1);
  };

  return (
    <Kartu className="space-y-3">
      <p className="font-bold">Tim panitia</p>
      <p className="text-sm text-slate-500">Undang email baru lewat Supabase (Authentication, lalu Users) dulu. Setelah akunnya ada, tambahkan di sini dan pilih perannya.</p>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <input className={field} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@contoh.com" type="email" />
        <select className={field} value={peran} onChange={(e) => setPeran(e.target.value as "owner" | "viewer")}>
          <option value="owner">Owner</option>
          <option value="viewer">Viewer</option>
        </select>
      </div>
      <button onClick={tambah} className={`${tombol} w-full`}>Tambahkan atau ubah peran</button>
      {info && <p className="rounded-xl bg-laut-50 px-3 py-2 text-sm text-laut-900">{info}</p>}
      <ul className="divide-y divide-slate-100">
        {(daftar ?? []).map((p) => (
          <li key={p.email} className="flex justify-between py-2 text-sm">
            <span className="truncate">{p.email}</span>
            <span className="font-semibold text-slate-500">{p.peran}</span>
          </li>
        ))}
      </ul>
    </Kartu>
  );
}
