import { ACARA } from "@/lib/acara";

export function Header() {
  return (
    <header className="flex items-center gap-3">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-700 text-lg font-bold text-white">CS</div>
      <div className="min-w-0">
        <p className="flex items-center gap-2 font-bold">
          {ACARA.nama}
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">Contoh</span>
        </p>
        <p className="truncate text-sm text-slate-500">
          {ACARA.penyelenggara} · {ACARA.tujuan}, {ACARA.tanggal}
        </p>
      </div>
    </header>
  );
}
