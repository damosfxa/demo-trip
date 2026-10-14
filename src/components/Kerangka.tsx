// Skeleton loading yang bentuk dan ukurannya mengikuti tampilan asli,
// supaya halaman tidak "melompat" saat data selesai dimuat.

const g = (w: string, h = "h-3", extra = "") => <span className={`kerangka block rounded-md ${h} ${w} ${extra}`} />;
const gGelap = (w: string, h = "h-3", extra = "") => <span className={`kerangka-gelap block rounded-md ${h} ${w} ${extra}`} />;
const kartu = "rounded-3xl bg-white shadow-sm ring-1 ring-black/5";

/** Sampul atas (tinggi sama dengan Hero). */
function SampulKerangka({ tinggi, besar = true }: { tinggi: string; besar?: boolean }) {
  return (
    <div className={`relative ${tinggi} overflow-hidden bg-laut-900`}>
      <div className="absolute inset-x-5 bottom-14 space-y-3">
        {gGelap("w-24")}
        {gGelap(besar ? "w-40" : "w-64", besar ? "h-11" : "h-9")}
        {!besar && gGelap("w-32", "h-9")}
        {gGelap("w-36", "h-4")}
        {gGelap("w-48", "h-8", "rounded-full")}
      </div>
    </div>
  );
}

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

export function KerangkaBeranda() {
  return (
    <div aria-busy="true" aria-label="Memuat">
      <SampulKerangka tinggi="h-[22rem]" />
      <div className="relative -mt-9 space-y-4 px-4">
        <KerangkaHitungMundur />
        <div className="grid grid-cols-2 gap-3">
          {[0, 1].map((i) => (
            <div key={i} className={`${kartu} h-32 space-y-3 p-4`}>
              <span className="kerangka block h-10 w-10 rounded-2xl" />
              {g("w-12")}
              {g("w-24", "h-5")}
            </div>
          ))}
        </div>
        <div className={`${kartu} flex h-[6.25rem] items-center gap-3 p-5`}>
          <span className="kerangka block h-14 w-14 shrink-0 rounded-2xl" />
          <div className="flex-1 space-y-2">{g("w-28")}{g("w-44", "h-4")}{g("w-36")}</div>
        </div>
        <div className={`${kartu} space-y-3 p-5`}>
          <div className="flex items-center gap-2"><span className="kerangka block h-8 w-8 rounded-xl" />{g("w-28", "h-4")}</div>
          {[0, 1].map((i) => (
            <div key={i} className="space-y-2 rounded-2xl bg-pasir-50 p-4">{g("w-20")}{g("w-full")}{g("w-3/4")}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function KerangkaRegistrasi() {
  return (
    <div aria-busy="true" aria-label="Memuat" className="pb-10">
      <SampulKerangka tinggi="h-72" besar={false} />
      <div className="relative -mt-8 mx-4 space-y-3 rounded-[2rem] bg-white p-5 shadow-[0_20px_40px_-20px_rgba(6,42,61,0.4)] ring-1 ring-black/5">
        <div className="mb-1 space-y-2">{g("w-44", "h-6")}{g("w-full")}{g("w-2/3")}</div>
        {[0, 1, 2, 3, 4].map((i) => <span key={i} className="kerangka block h-[3.6rem] rounded-2xl" />)}
        <span className="kerangka block h-14 rounded-2xl" />
      </div>
    </div>
  );
}

/** Kartu peserta (boarding pass) saat data peserta belum ada. */
export function KerangkaKartu() {
  return (
    <div aria-busy="true" aria-label="Memuat" className="px-4 pt-6">
      <div className="flex h-4 items-center">{g("w-20")}</div>
      <div className="flex h-9 items-center">{g("w-48", "h-8")}</div>
      <div className={`mt-5 overflow-hidden rounded-[2rem] ${kartu}`}>
        <div className="h-[11.3rem] space-y-4 bg-laut-900 px-6 pt-5">
          <div className="flex justify-between">{gGelap("w-24")}{gGelap("w-28")}</div>
          <div className="flex items-end justify-between pt-2">{gGelap("w-16", "h-10")}{gGelap("w-16", "h-10")}</div>
          {gGelap("w-56")}
        </div>
        <div className="grid h-[11.9rem] grid-cols-2 content-start gap-x-4 gap-y-3 px-6 py-5">
          <div className="col-span-2 space-y-1.5">{g("w-24")}{g("w-44", "h-6")}</div>
          {[0, 1, 2, 3].map((i) => <div key={i} className="space-y-1.5">{g("w-16")}{g("w-24", "h-4")}</div>)}
        </div>
        <div className="h-6" />
        <div className="flex h-[17.25rem] flex-col items-center gap-3 px-6 pt-2">
          <span className="kerangka block h-48 w-48 rounded-2xl" />
          {g("w-56")}
        </div>
      </div>
      <div className={`mt-5 h-[17.5rem] space-y-3 p-5 ${kartu}`}>
        {g("w-32", "h-4")}
        <div className="grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((i) => <span key={i} className="kerangka block h-24 rounded-2xl" />)}
        </div>
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
