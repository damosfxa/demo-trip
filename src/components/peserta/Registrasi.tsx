"use client";

import { useState } from "react";
import { daftar, simpanToken } from "@/lib/data-peserta";
import { useSekarang } from "@/lib/jam";
import type { Trip } from "@/lib/types";
import { rentangTanggal } from "@/lib/waktu";
import { kamus, useBahasa } from "@/lib/bahasa";
import { IkonCentang, IkonKalender, IkonPesawat } from "../Ikon";
import { Hero } from "./Hero";

const field =
  "peer w-full rounded-2xl border border-slate-200 bg-white px-4 pb-2.5 pt-6 text-base text-laut-950 outline-none transition focus:border-laut-600 focus:ring-4 focus:ring-laut-500/15";
const label = "pointer-events-none absolute left-4 top-2 text-xs font-semibold text-slate-500 transition-all peer-focus:text-laut-700";

export function Registrasi({ trip }: { trip: Trip }) {
  const t = kamus(useBahasa());
  const sekarang = useSekarang();
  const [nama, setNama] = useState("");
  const [departemen, setDepartemen] = useState("");
  const [hp, setHp] = useState("");
  const [isian, setIsian] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [kirim, setKirim] = useState(false);
  const [berhasil, setBerhasil] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (nama.trim().length < 2) return setError(t("errNama"));
    if (!departemen) return setError(t("errDept"));
    const kosong = trip.isian.find((f) => f.wajib && !(isian[f.id] ?? "").trim());
    if (kosong) return setError(t("wajibDiisi", { label: kosong.label }));
    setKirim(true);
    try {
      const token = await daftar(trip.slug, nama, departemen, hp, isian);
      setBerhasil(true);
      // Beri waktu animasi sambutan sebelum masuk ke beranda.
      setTimeout(() => simpanToken(trip.slug, token), 1900);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setKirim(false);
    }
  };

  return (
    <div className="pb-10">
      <Hero trip={trip} sekarang={sekarang} tinggi="h-72">
        <p className="text-sm font-medium text-white/85">{trip.penyelenggara ?? t("undangan")}</p>
        <h1 className="text-4xl font-extrabold tracking-tight">{trip.nama}</h1>
        <div className="mt-3 inline-flex w-fit items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-sm font-semibold backdrop-blur-md">
          <IkonKalender className="h-4 w-4" /> {trip.tujuan} · {rentangTanggal(trip.mulai, trip.selesai)}
        </div>
      </Hero>

      <form onSubmit={submit} className="relative -mt-8 mx-4 space-y-3 rounded-[2rem] bg-white p-5 shadow-[0_20px_40px_-20px_rgba(6,42,61,0.4)] ring-1 ring-black/5">
        <div className="mb-1">
          <h2 className="text-xl font-extrabold text-laut-950">{t("daftarJudul")}</h2>
          <p className="text-sm text-slate-500">{t("daftarDesk")}</p>
        </div>

        <div className="relative">
          <input id="nama" className={field} value={nama} onChange={(e) => setNama(e.target.value)} placeholder=" " autoComplete="name" />
          <label htmlFor="nama" className={label}>{t("namaLabel")}</label>
        </div>
        <div className="relative">
          <select id="dept" className={`${field} appearance-none`} value={departemen} onChange={(e) => setDepartemen(e.target.value)}>
            <option value="">{t("pilihDept")}</option>
            {trip.departemen.map((d) => <option key={d}>{d}</option>)}
          </select>
          <label htmlFor="dept" className={label}>{t("deptLabel")}</label>
        </div>
        <div className="relative">
          <input id="hp" className={field} value={hp} onChange={(e) => setHp(e.target.value)} placeholder=" " inputMode="tel" autoComplete="tel" />
          <label htmlFor="hp" className={label}>{t("hpLabel")}</label>
        </div>

        {/* Isian tambahan yang diatur panitia */}
        {trip.isian.map((f) => (
          <div key={f.id} className="relative">
            {f.pilihan.length > 0 ? (
              <select id={`isian-${f.id}`} className={`${field} appearance-none`} value={isian[f.id] ?? ""} onChange={(e) => setIsian({ ...isian, [f.id]: e.target.value })}>
                <option value="">{t("pilih")}</option>
                {f.pilihan.map((o) => <option key={o}>{o}</option>)}
              </select>
            ) : (
              <input id={`isian-${f.id}`} className={field} value={isian[f.id] ?? ""} onChange={(e) => setIsian({ ...isian, [f.id]: e.target.value })} placeholder=" " maxLength={200} />
            )}
            <label htmlFor={`isian-${f.id}`} className={label}>{f.label}{!f.wajib && ` ${t("opsional")}`}</label>
          </div>
        ))}

        {error && <p className="anim-naik rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}

        <button disabled={kirim} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-laut-900 py-4 text-base font-bold text-white shadow-lg shadow-laut-900/25 transition active:scale-[0.98] disabled:opacity-70">
          {kirim ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <IkonPesawat className="h-5 w-5" />}
          {kirim ? t("mendaftar") : t("daftarTombol")}
        </button>
        <p className="text-center text-xs leading-relaxed text-slate-500">{t("sudahDaftar")}</p>
      </form>

      {berhasil && (
        <div className="anim-pudar fixed inset-0 z-50 flex flex-col items-center justify-center bg-laut-900 px-8 text-center text-white">
          <div className="relative">
            <span className="anim-pop flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500 shadow-[0_0_0_12px_rgba(16,185,129,0.2)]">
              <IkonCentang className="h-12 w-12" />
            </span>
            <IkonPesawat className="pesawat absolute -top-6 left-0 h-7 w-7 text-mentari-400" />
          </div>
          <p className="anim-naik mt-8 text-3xl font-extrabold" style={{ animationDelay: "250ms" }}>{t("selamat", { nama: nama.trim().split(" ")[0] })}</p>
          <p className="anim-naik mt-2 text-white/75" style={{ animationDelay: "380ms" }}>{t("menyiapkan", { tujuan: trip.tujuan })}</p>
        </div>
      )}
    </div>
  );
}
