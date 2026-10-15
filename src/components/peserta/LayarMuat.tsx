import { gayaTema } from "@/lib/tema";
import type { Tema } from "@/lib/types";
import { IkonPesawat } from "../Ikon";

/**
 * Layar pembuka yang tampil saat data trip dimuat. Hanya pesawat yang terbang melintas di langit biru,
 * dengan nama trip di bawahnya bila sudah ada di HP.
 */
export function LayarMuat({ nama, tujuan, tema }: { nama?: string; tujuan?: string; tema?: Tema }) {
  return (
    <div role="status" aria-label="Memuat aplikasi" style={gayaTema(tema)} className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-laut-950 px-8 text-center text-white">
      <div className="relative h-40 w-full">
        <span className="anim-terbang-lewat absolute left-0 top-1/2 text-mentari-400">
          <IkonPesawat className="h-12 w-12" />
        </span>
      </div>
      {nama && (
        <>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-mentari-400">Info Trip</p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight">{nama}</h1>
          {tujuan && <p className="mt-1 text-white/80">{tujuan}</p>}
        </>
      )}
    </div>
  );
}
