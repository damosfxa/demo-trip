"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { DaftarTrip } from "@/components/panitia/DaftarTrip";
import { Login } from "@/components/panitia/Login";
import { PanelTrip } from "@/components/panitia/PanelTrip";
import { useSesi } from "@/lib/panitia";
import { siap, supabase } from "@/lib/supabase";

function Isi() {
  const tripId = useSearchParams().get("trip");
  const { sesi, peran } = useSesi();

  if (!siap) return <p className="p-6 text-center text-red-600">Aplikasi belum terhubung ke database (environment belum diisi).</p>;
  if (sesi === undefined || (sesi && peran === undefined)) return <div className="m-4 h-64 animate-pulse rounded-3xl bg-slate-200" />;
  if (!sesi) return <Login />;
  if (!peran) {
    return (
      <div className="space-y-3 px-4 pt-16 text-center">
        <p className="text-lg font-bold">Akun ini belum terdaftar sebagai panitia.</p>
        <button onClick={() => supabase.auth.signOut()} className="font-semibold text-sky-700">Keluar</button>
      </div>
    );
  }

  const bisaUbah = peran === "owner";
  return (
    <div className="space-y-4 px-4 pb-16 pt-5">
      <div className="flex items-center justify-between text-sm">
        <span className="truncate text-slate-500">{sesi.user.email}</span>
        <button onClick={() => supabase.auth.signOut()} className="shrink-0 font-semibold text-slate-500">Keluar</button>
      </div>
      {!bisaUbah && (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
          Akun demo: bisa melihat semua fitur panitia, tapi tidak bisa mengubah data.
        </p>
      )}
      {tripId ? <PanelTrip id={tripId} bisaUbah={bisaUbah} /> : <DaftarTrip bisaUbah={bisaUbah} />}
    </div>
  );
}

export default function HalamanPanitia() {
  return (
    <Suspense fallback={null}>
      <Isi />
    </Suspense>
  );
}
