// Ilustrasi pemandangan pantai yang bergerak (SVG, tanpa gambar luar, tetap tampil saat offline).
// Warnanya mengikuti waktu: siang, senja, atau malam.

export type Suasana = "siang" | "senja" | "malam";

export function suasanaDari(jam: number): Suasana {
  if (jam >= 17 && jam < 19) return "senja";
  if (jam >= 19 || jam < 5) return "malam";
  return "siang";
}

const WARNA: Record<Suasana, { langit: string; langitBawah: string; matahari: string; gunungJauh: string; gunung: string; laut: string; lautMuda: string; pulau: string; awan: string }> = {
  siang: { langit: "#7cc8e3", langitBawah: "#b9e3f1", matahari: "#fbc84b", gunungJauh: "#8fbfcf", gunung: "#5f9fb3", laut: "#11789f", lautMuda: "#2a9dc4", pulau: "#0a3a52", awan: "#ffffff" },
  senja: { langit: "#f39a7b", langitBawah: "#f9c58f", matahari: "#fde68a", gunungJauh: "#c98a8a", gunung: "#9a6476", laut: "#5b4f7d", lautMuda: "#7c6a96", pulau: "#2e2340", awan: "#fde2cf" },
  malam: { langit: "#0a2236", langitBawah: "#123552", matahari: "#f5f0dc", gunungJauh: "#1b3d58", gunung: "#14304a", laut: "#0b2a42", lautMuda: "#123b5a", pulau: "#06182a", awan: "#2c4a66" },
};

// Gelombang yang berulang tiap 200 unit supaya bisa digeser tanpa terlihat sambungannya.
const gelombang = (y: number, tinggi: number) => `M0 ${y} ` + `q 50 ${-tinggi} 100 0 t 100 0 `.repeat(4) + "V 260 H 0 Z";

export function Pemandangan({ suasana = "siang", className = "" }: { suasana?: Suasana; className?: string }) {
  const w = WARNA[suasana];
  const malam = suasana === "malam";
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

      {/* Matahari atau bulan */}
      <g transform="translate(300 78)">
        <circle className="sinar" r="34" fill={w.matahari} opacity="0.4" />
        <circle r="22" fill={w.matahari} />
        {malam && <circle cx="9" cy="-6" r="20" fill={w.langit} />}
      </g>

      {/* Awan bergerak */}
      {[{ y: 42, d: 38, s: 1 }, { y: 70, d: 55, s: 0.75, delay: -20 }, { y: 28, d: 70, s: 0.6, delay: -45 }].map((a, i) => (
        <g key={i} className="awan" style={{ animationDuration: `${a.d}s`, animationDelay: `${a.delay ?? 0}s` }} opacity={malam ? 0.5 : 0.95}>
          <g transform={`translate(0 ${a.y}) scale(${a.s})`} fill={w.awan}>
            <ellipse cx="40" cy="10" rx="30" ry="12" />
            <ellipse cx="62" cy="4" rx="20" ry="14" />
            <ellipse cx="22" cy="8" rx="16" ry="10" />
          </g>
        </g>
      ))}

      {/* Pesawat dengan jejak putus-putus */}
      {!malam && (
        <g className="pesawat">
          {/* Jejak kondensasi */}
          <path d="M-90 16.5 H-4" stroke="#fff" strokeWidth="1.4" strokeDasharray="7 7" strokeLinecap="round" opacity="0.7" />
          <path d="M-60 19.5 H-4" stroke="#fff" strokeWidth="1" strokeDasharray="5 8" strokeLinecap="round" opacity="0.45" />
          {/* Jet penumpang, tampak samping, menghadap kanan */}
          <g transform="scale(0.8)">
            <path d="M25 13.6 L19.5 6.5 H22.6 L31 13.6 Z" fill="#dbe9f0" />
            <path d="M5.5 14 L1.5 4.2 H5.6 L13 14 Z" fill="#fff" />
            <path d="M4 14 H44 C50 14 54.2 15.3 56.5 17 C54.2 18.7 50 20 44 20 H7 C4.6 20 3 19 3 17 C3 15.4 3.4 14 4 14 Z" fill="#fff" />
            <path d="M23 18.2 L15 27.5 H19.4 L33 18.2 Z" fill="#fff" />
            <path d="M6 17.2 L1.5 21 H5.4 L11 18 Z" fill="#fff" />
            {[16, 20, 24, 28, 32, 36, 40].map((x) => <circle key={x} cx={x} cy="16.2" r="0.85" fill="#0e5f80" opacity="0.55" />)}
            <path d="M48.5 15.4 Q51.5 15.6 53.4 16.4 L48.6 16.4 Z" fill="#0e5f80" opacity="0.6" />
          </g>
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
        <rect key={i} x={x} y={y} width={l} height="2" rx="1" fill={w.matahari} opacity="0.5">
          <animate attributeName="opacity" values="0.15;0.6;0.15" dur={`${3 + i}s`} repeatCount="indefinite" />
        </rect>
      ))}
    </svg>
  );
}
