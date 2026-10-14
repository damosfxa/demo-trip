// Skeleton loading yang bentuk dan ukurannya mengikuti tampilan asli,
// supaya halaman tidak "melompat" saat data selesai dimuat.

const g = (w: string, h = "h-3", extra = "") => <span className={`kerangka block rounded-md ${h} ${w} ${extra}`} />;
const kartu = "rounded-3xl bg-white shadow-sm ring-1 ring-black/5";

export function KerangkaHitungMundur() {
  return (
    <div className={`${kartu} h-32 p-4 shadow-[0_12px_30px_-12px_rgba(6,42,61,0.35)]`}>
      <div className="mx-auto mb-3 w-40">{g("w-40")}</div>
      <div className="grid grid-cols-4 gap-2">
        {[0, 1, 2, 3].map((i) => <span key={i} className="kerangka block h-[3.75rem] rounded-2xl" />)}
      </div>
    </div>
  );
}

/** Daftar trip di panel panitia. */
export function KerangkaDaftarTrip() {
  return (
    <div aria-busy="true" aria-label="Memuat" className="space-y-4">
      {[0, 1].map((i) => (
        <div key={i} className={`${kartu} flex h-32 flex-col justify-between p-5`}>
          <div className="space-y-2">{g("w-44", "h-4")}{g("w-56")}</div>
          {g("w-36", "h-7")}
        </div>
      ))}
    </div>
  );
}

/** Panel satu trip (judul, tab, ringkasan). */
export function KerangkaPanel() {
  const batang = (n: number) =>
    Array.from({ length: n }, (_, i) => (
      <div key={i} className="space-y-2">
        <div className="flex justify-between">{g("w-28")}{g("w-10")}</div>
        {g("w-full", "h-2.5", "rounded-full")}
      </div>
    ));
  return (
    <div aria-busy="true" aria-label="Memuat" className="space-y-4">
      <div className="flex h-20 flex-col justify-between py-1">{g("w-24", "h-3.5")}{g("w-56", "h-7")}{g("w-48", "h-3.5")}</div>
      <span className="kerangka block h-11 rounded-2xl" />
      <div className="grid grid-cols-2 gap-3">
        {[0, 1].map((i) => <div key={i} className={`${kartu} h-[6.6rem] space-y-3 p-4`}>{g("w-20")}{g("w-14", "h-9")}</div>)}
      </div>
      <div className={`${kartu} h-64 space-y-4 p-5`}>{g("w-44", "h-4")}{batang(4)}</div>
      <div className={`${kartu} h-[25rem] space-y-4 p-5`}>{g("w-44", "h-4")}{batang(7)}</div>
      <div className={`${kartu} h-[21.5rem] space-y-3 p-5`}>
        {g("w-40", "h-4")}
        <span className="kerangka block h-14 rounded-xl" />
        <div className="grid grid-cols-2 gap-2"><span className="kerangka block h-10 rounded-xl" /><span className="kerangka block h-10 rounded-xl" /></div>
        <div className="flex items-center gap-4 rounded-2xl bg-pasir-50 p-3"><span className="kerangka block h-24 w-24 rounded-lg" /><div className="flex-1 space-y-2">{g("w-40")}{g("w-32")}{g("w-20")}</div></div>
      </div>
    </div>
  );
}

/** Pemeriksaan sesi login panitia. */
export function KerangkaPanitia() {
  return (
    <div aria-busy="true" aria-label="Memuat" className="space-y-4 px-4 pb-16 pt-5">
      <div className="flex justify-between">{g("w-40")}{g("w-12")}</div>
      <KerangkaPanel />
    </div>
  );
}
