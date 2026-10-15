"use client";

import { useSekarang } from "@/lib/jam";

// Ilustrasi pemandangan pantai. Warna langit berubah pelan-pelan sepanjang hari (malam, fajar, siang, senja),
// matahari terbit sekitar pukul 5.30 dan terbenam sekitar 18.30, lalu bulan muncul menggantikannya.

export type Suasana = "siang" | "senja" | "malam";

export function suasanaDari(jam: number): Suasana {
  if (jam >= 17 && jam < 19) return "senja";
  if (jam >= 19 || jam < 5) return "malam";
  return "siang";
}

/** Jam di zona tertentu sebagai pecahan (misalnya 16.5 untuk 16.30). */
export function jamPecahan(zona: string, waktu: number) {
  const bagian = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: zona }).formatToParts(new Date(waktu || Date.now()));
  const jam = Number(bagian.find((b) => b.type === "hour")?.value ?? 0);
  const menit = Number(bagian.find((b) => b.type === "minute")?.value ?? 0);
  return jam + menit / 60;
}

type Palet = { langit: string; langitBawah: string; gunungJauh: string; gunung: string; laut: string; lautMuda: string; pulau: string };

const MALAM: Palet = { langit: "#0a2236", langitBawah: "#123552", gunungJauh: "#1b3d58", gunung: "#14304a", laut: "#0b2a42", lautMuda: "#123b5a", pulau: "#06182a" };
const FAJAR: Palet = { langit: "#e9a0a0", langitBawah: "#f7c99a", gunungJauh: "#b98a9c", gunung: "#7d6382", laut: "#4f5f8a", lautMuda: "#6f7fa8", pulau: "#2a2440" };
const SIANG: Palet = { langit: "#7cc8e3", langitBawah: "#b9e3f1", gunungJauh: "#8fbfcf", gunung: "#5f9fb3", laut: "#11789f", lautMuda: "#2a9dc4", pulau: "#0a3a52" };
const SENJA: Palet = { langit: "#f39a7b", langitBawah: "#f9c58f", gunungJauh: "#c98a8a", gunung: "#9a6476", laut: "#5b4f7d", lautMuda: "#7c6a96", pulau: "#2e2340" };

const batas = (x: number) => Math.max(0, Math.min(1, x));

function hexKeRgb(h: string): [number, number, number] {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const campur = (a: string, b: string, t: number) => {
  const [r1, g1, b1] = hexKeRgb(a);
  const [r2, g2, b2] = hexKeRgb(b);
  const c = (x: number, y: number) => Math.round(x + (y - x) * t).toString(16).padStart(2, "0");
  return `#${c(r1, r2)}${c(g1, g2)}${c(b1, b2)}`;
};

/** Warna langit dan laut untuk jam tertentu, mengikuti waktu terbit dan terbenam asli (fajar dan senja sekitar satu jam). */
function paletPada(jam: number, terbit: number, terbenam: number): Palet {
  const titik: [number, Palet][] = [
    [0, MALAM],
    [terbit - 1, MALAM],
    [terbit + 0.75, FAJAR],
    [terbit + 2, SIANG],
    [terbenam - 1.5, SIANG],
    [terbenam, SENJA],
    [terbenam + 1.2, MALAM],
    [24, MALAM],
  ];
  const j = ((jam % 24) + 24) % 24;
  for (let i = 0; i < titik.length - 1; i++) {
    const [a, pa] = titik[i];
    const [b, pb] = titik[i + 1];
    if (j >= a && j <= b && b > a) {
      const t = (j - a) / (b - a);
      const hasil = {} as Palet;
      (Object.keys(pa) as (keyof Palet)[]).forEach((k) => (hasil[k] = campur(pa[k], pb[k], t)));
      return hasil;
    }
  }
  return MALAM;
}

// Gelombang yang berulang tiap 200 unit supaya bisa digeser tanpa terlihat sambungannya.
const gelombang = (y: number, tinggi: number) => `M0 ${y} ` + `q 50 ${-tinggi} 100 0 t 100 0 `.repeat(4) + "V 260 H 0 Z";

/** Keadaan matahari dan bulan dari jam, memakai waktu terbit dan terbenam asli. */
function keadaanLangit(jam: number, terbit: number, terbenam: number) {
  const panjangSiang = terbenam - terbit;
  const tSiang = batas((jam - terbit) / panjangSiang);
  const matahariTerlihat = batas(Math.min((jam - terbit) / 0.5, (terbenam - jam) / 0.5));
  const panjangMalam = terbit + 24 - terbenam;
  const tMalam = batas(((jam - terbenam + 24) % 24) / panjangMalam);
  const bulanTerlihat = batas(Math.min(((jam - terbenam + 24) % 24) / 0.5, (terbit + 24 - jam) / 0.5));
  return {
    matahari: { x: 90 + 220 * tSiang, y: 214 - 160 * Math.sin(Math.PI * tSiang), opacity: matahariTerlihat },
    bulan: { x: 90 + 220 * tMalam, y: 214 - 150 * Math.sin(Math.PI * tMalam), opacity: bulanTerlihat },
  };
}

export function Pemandangan({ jam, cuaca, className = "" }: { suasana?: Suasana; jam?: number; cuaca?: { terbit: number; terbenam: number; awan: number; kode: number } | null; className?: string }) {
  // Tanpa jam dari pemanggil, pakai jam sekarang (zona Indonesia), diperbarui tiap menit.
  const waktu = useSekarang();
  const sekarang = jam ?? (waktu ? jamPecahan("Asia/Jakarta", waktu) : 12);
  const terbit = cuaca?.terbit ?? 5.5;
  const terbenam = cuaca?.terbenam ?? 18.5;
  const w = paletPada(sekarang, terbit, terbenam);
  const langit = keadaanLangit(sekarang, terbit, terbenam);
  const hujan = (cuaca?.kode ?? 0) >= 51;
  const awan = cuaca ? 0.25 + 0.7 * (cuaca.awan / 100) : 0.9;
  const bintang = langit.bulan.opacity;
  const transisi = { transition: "transform 1.6s ease, opacity 1.6s ease" } as const;

  return (
    <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden>
      {/* Langit dua lapis */}
      <rect width="400" height="260" fill={w.langit} />
      <rect y="110" width="400" height="80" fill={w.langitBawah} opacity="0.7" />

      {/* Bintang: muncul saat bulan terlihat */}
      <g opacity={bintang}>
        {[[30, 30], [80, 60], [140, 22], [210, 48], [260, 18], [330, 40], [370, 70], [110, 95], [300, 92]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.6 : 1} fill="#fff" opacity={0.5 + (i % 3) * 0.2}>
            <animate attributeName="opacity" values="0.2;1;0.2" dur={`${2 + (i % 4)}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </g>

      {/* Bulan */}
      <g style={{ ...transisi, transform: `translate(${langit.bulan.x - 30}px, ${langit.bulan.y - 30}px)`, opacity: langit.bulan.opacity }}>
        <image href="/ikon/bulan.png" width="60" height="60" />
      </g>

      {/* Matahari */}
      <g style={{ ...transisi, transform: `translate(${langit.matahari.x - 35}px, ${langit.matahari.y - 35}px)`, opacity: langit.matahari.opacity }}>
        <image href="/ikon/matahari.png" width="70" height="70" />
      </g>

      {/* Awan bergerak */}
      {[{ y: 40, d: 38, s: 1, delay: 0 }, { y: 70, d: 55, s: 0.7, delay: -20 }, { y: 26, d: 70, s: 0.55, delay: -45 }].map((a, i) => (
        <g key={i} className="awan" style={{ animationDuration: `${a.d}s`, animationDelay: `${a.delay}s` }} opacity={awan * (0.5 + 0.5 * Math.max(langit.matahari.opacity, langit.bulan.opacity))}>
          <image href="/ikon/awan-kartun.png" x="0" y={a.y} width={120 * a.s} height={70 * a.s} />
        </g>
      ))}

      {/* Hujan: garis-garis miring saat kode cuaca hujan */}
      {hujan && (
        <g className="hujan" stroke="#dbeafe" strokeWidth="1" strokeLinecap="round" opacity="0.75">
          {Array.from({ length: 22 }, (_, i) => (
            <line key={i} x1={20 + i * 17} y1={-20} x2={10 + i * 17} y2={20} />
          ))}
        </g>
      )}

      {/* Pesawat terbang melintas saat matahari terlihat */}
      <g opacity={langit.matahari.opacity}>
        <g className="pesawat">
          <image href="/ikon/pesawat.png" x="0" y="0" width="64" height="32" />
        </g>
      </g>

      {/* Gunung */}
      <path d="M0 175 L60 120 L110 160 L170 105 L240 165 L300 125 L400 172 V260 H0 Z" fill={w.gunungJauh} />
      <path d="M0 190 L50 150 L95 182 L150 140 L210 188 L270 158 L330 186 L400 160 V260 H0 Z" fill={w.gunung} />

      {/* Pulau dengan gapura (candi bentar) dan pohon kelapa */}
      <g fill={w.pulau}>
        <path d="M30 200 Q90 176 170 196 Z" />
        <path d="M70 191 h10 v-26 l-3 -4 v-6 l-2 -3 l-2 3 v6 l-3 4 Z" />
        <path d="M86 191 h10 v-26 l-3 -4 v-6 l-2 -3 l-2 3 v6 l-3 4 Z" />
        <path d="M135 196 q2 -24 10 -38" stroke={w.pulau} strokeWidth="3" fill="none" />
        <path d="M145 158 q-14 -6 -24 2 q12 -2 24 -2 q-8 -12 -20 -12 q12 4 20 12 q2 -14 14 -18 q-10 8 -14 18 q14 -6 24 2 q-12 -2 -24 -2" />
      </g>

      {/* Laut berlapis dengan ombak bergerak */}
      <g className="ombak" style={{ animationDuration: "9s" }}>
        <path d={gelombang(200, 6)} fill={w.lautMuda} />
      </g>
      <g className="ombak" style={{ animationDuration: "6s", animationDirection: "reverse" }}>
        <path d={gelombang(214, 5)} fill={w.laut} opacity="0.9" />
      </g>

      {/* Kilau cahaya di permukaan laut */}
      {[[250, 222, 40], [290, 232, 26], [210, 240, 18]].map(([x, y, l], i) => (
        <rect key={i} x={x} y={y} width={l} height="2" rx="1" fill="#fbc84b" opacity="0.5">
          <animate attributeName="opacity" values="0.15;0.6;0.15" dur={`${3 + i}s`} repeatCount="indefinite" />
        </rect>
      ))}
    </svg>
  );
}
