"use client";

import { useSekarang } from "@/lib/jam";

// Ilustrasi pemandangan pantai (SVG dengan gambar matahari, bulan, awan, dan pesawat).
// Matahari dan bulan bergerak mengikuti jam asli: matahari terbit sekitar pukul 5, terbenam sekitar 18.30,
// lalu bulan naik sampai pagi. Perpindahan dibuat halus lewat transisi CSS.

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

const WARNA: Record<Suasana, { langit: string; langitBawah: string; gunungJauh: string; gunung: string; laut: string; lautMuda: string; pulau: string }> = {
  siang: { langit: "#7cc8e3", langitBawah: "#b9e3f1", gunungJauh: "#8fbfcf", gunung: "#5f9fb3", laut: "#11789f", lautMuda: "#2a9dc4", pulau: "#0a3a52" },
  senja: { langit: "#f39a7b", langitBawah: "#f9c58f", gunungJauh: "#c98a8a", gunung: "#9a6476", laut: "#5b4f7d", lautMuda: "#7c6a96", pulau: "#2e2340" },
  malam: { langit: "#0a2236", langitBawah: "#123552", gunungJauh: "#1b3d58", gunung: "#14304a", laut: "#0b2a42", lautMuda: "#123b5a", pulau: "#06182a" },
};

const batas = (x: number) => Math.max(0, Math.min(1, x));

// Gelombang yang berulang tiap 200 unit supaya bisa digeser tanpa terlihat sambungannya.
const gelombang = (y: number, tinggi: number) => `M0 ${y} ` + `q 50 ${-tinggi} 100 0 t 100 0 `.repeat(4) + "V 260 H 0 Z";

/** Posisi matahari dan bulan dari jam. Matahari di busur siang, bulan di busur malam. */
function posisiLangit(jam: number) {
  const tSiang = batas((jam - 5) / 13.5);
  const tMalam = batas(((jam - 18.5 + 24) % 24) / 11.5);
  const matahariTampak = batas(Math.min(jam - 4.5, 19.5 - jam));
  const bulanTampak = 1 - matahariTampak;
  return {
    matahari: { x: 50 + 300 * tSiang, y: 214 - 160 * Math.sin(Math.PI * tSiang), opacity: matahariTampak },
    bulan: { x: 50 + 300 * tMalam, y: 214 - 150 * Math.sin(Math.PI * tMalam), opacity: bulanTampak },
  };
}

export function Pemandangan({ suasana, jam, className = "" }: { suasana?: Suasana; jam?: number; className?: string }) {
  // Tanpa jam dari pemanggil, pakai jam sekarang (zona Indonesia), diperbarui tiap menit.
  const waktu = useSekarang();
  const sekarang = jam ?? (waktu ? jamPecahan("Asia/Jakarta", waktu) : 12);
  const s = suasana ?? suasanaDari(Math.floor(sekarang));
  const w = WARNA[s];
  const langit = posisiLangit(sekarang);
  const malam = s === "malam";
  const transisi = { transition: "transform 1.6s ease, opacity 1.6s ease" } as const;

  return (
    <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden>
      {/* Langit dua lapis */}
      <rect width="400" height="260" fill={w.langit} />
      <rect y="110" width="400" height="80" fill={w.langitBawah} opacity="0.7" />

      {/* Bintang (malam) */}
      {malam &&
        [[30, 30], [80, 60], [140, 22], [210, 48], [260, 18], [330, 40], [370, 70], [110, 95], [300, 92]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.6 : 1} fill="#fff" opacity={0.5 + (i % 3) * 0.2}>
            <animate attributeName="opacity" values="0.2;1;0.2" dur={`${2 + (i % 4)}s`} repeatCount="indefinite" />
          </circle>
        ))}

      {/* Bulan: naik di malam hari, turun pelan saat pagi */}
      <g style={{ ...transisi, transform: `translate(${langit.bulan.x - 30}px, ${langit.bulan.y - 30}px)`, opacity: langit.bulan.opacity }}>
        <image href="/ikon/bulan.png" width="60" height="60" />
      </g>

      {/* Matahari: terbit dari laut, naik, lalu terbenam */}
      <g style={{ ...transisi, transform: `translate(${langit.matahari.x - 35}px, ${langit.matahari.y - 35}px)`, opacity: langit.matahari.opacity }}>
        <image href="/ikon/matahari.png" width="70" height="70" />
      </g>

      {/* Awan bergerak */}
      {[{ y: 40, d: 38, s: 1, delay: 0 }, { y: 70, d: 55, s: 0.7, delay: -20 }, { y: 26, d: 70, s: 0.55, delay: -45 }].map((a, i) => (
        <g key={i} className="awan" style={{ animationDuration: `${a.d}s`, animationDelay: `${a.delay}s` }} opacity={malam ? 0.45 : 0.95}>
          <image href="/ikon/awan.png" x="0" y={a.y} width={120 * a.s} height={54 * a.s} />
        </g>
      ))}

      {/* Pesawat terbang melintas (hanya siang) */}
      {!malam && (
        <g className="pesawat">
          <image href="/ikon/pesawat.png" x="0" y="0" width="64" height="32" />
        </g>
      )}

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
