"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { KerangkaPanitia } from "@/components/Kerangka";
import { DaftarTrip } from "@/components/panitia/DaftarTrip";
import { Login } from "@/components/panitia/Login";
import { PanelTrip } from "@/components/panitia/PanelTrip";
import { useSesi } from "@/lib/panitia";
import { siap, supabase } from "@/lib/supabase";

function Isi() {
  const tripId = useSearchParams().get("trip");
  const { sesi, peran } = useSesi();

  if (!siap) return <p className="p-6 text-center text-red-600">Aplikasi belum terhubung ke database (environment belum diisi).</p>;
  if (sesi === undefined || (sesi && peran === undefined)) return <KerangkaPanitia />;
  if (!sesi) return <Login />;
  if (!peran) {
    return (
      <div className="space-y-3 px-4 pt-16 text-center">
        <p className="text-lg font-bold">Akun ini belum terdaftar sebagai panitia.</p>
        <button onClick={() => supabase.auth.signOut()} className="font-semibold text-laut-700">Keluar</button>
      </div>
    );
  }

  const bisaUbah = peran === "owner";
  return (
    <div className="space-y-4 px-4 pb-16 pt-5">
      <header className="-mx-4 flex items-center justify-between gap-3 bg-laut-950 px-5 py-4 text-white sm:rounded-b-3xl">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-mentari-400">Info Trip</p>
          <p className="text-lg font-extrabold">Panel panitia</p>
        </div>
        <div className="flex min-w-0 items-center gap-3 text-sm">
          <span className="truncate text-white/70">{sesi.user.email}</span>
          <button onClick={() => supabase.auth.signOut()} className="shrink-0 rounded-xl bg-white/10 px-3 py-1.5 font-semibold text-white">Keluar</button>
        </div>
      </header>
      {!bisaUbah && (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
          Akun demo: bisa melihat semua fitur panitia, tapi tidak bisa mengubah data.
        </p>
      )}
      {tripId ? <PanelTrip id={tripId} bisaUbah={bisaUbah} /> : <DaftarTrip bisaUbah={bisaUbah} />}
    </div>
  );
}

// Panel panitia memakai lebar layar yang lebih lebar daripada tampilan HP peserta (lihat .panel-lebar di globals.css).
export default function HalamanPanitia() {
  return (
    <div className="panel-lebar min-h-dvh bg-slate-100">
      <Suspense fallback={null}>
        <Isi />
      </Suspense>
    </div>
  );
}
