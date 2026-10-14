// Komponen kecil yang dipakai di halaman panitia.

export const field = "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20 disabled:bg-slate-50";
export const tombol = "rounded-xl bg-sky-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-sky-800 disabled:opacity-50";
export const tombolGaris = "rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50";

export function Kartu({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 ${className}`}>{children}</div>;
}

export function Label({ teks, children, catatan }: { teks: string; children: React.ReactNode; catatan?: string }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-semibold">{teks}</span>
      {children}
      {catatan && <span className="block text-xs text-slate-500">{catatan}</span>}
    </label>
  );
}

export function Batang({ label, nilai, total, warna = "bg-sky-600" }: { label: string; nilai: number; total: number; warna?: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span>{label}</span>
        <span className="font-semibold tabular-nums">{nilai}{total ? ` / ${total}` : ""}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${warna}`} style={{ width: `${total ? Math.min(100, (nilai / total) * 100) : 0}%` }} />
      </div>
    </div>
  );
}
