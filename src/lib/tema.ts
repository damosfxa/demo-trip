import type { Tema } from "./types";

// Tema warna per trip, supaya aplikasi tampil dengan warna agen masing-masing.
// Semua komponen memakai warna "laut-*"; tema cukup menimpa variabel warnanya.

type Palet = Record<"50" | "100" | "500" | "600" | "700" | "800" | "900" | "950", string>;

export const TEMA: Record<Tema, { nama: string; palet: Palet }> = {
  laut: { nama: "Laut", palet: { 50: "#f0f8fb", 100: "#dff1f8", 500: "#1a93be", 600: "#11789f", 700: "#0e5f80", 800: "#0c4a66", 900: "#0a3a52", 950: "#062a3d" } },
  hutan: { nama: "Hutan", palet: { 50: "#f1f8f4", 100: "#dcefe3", 500: "#2f9a62", 600: "#23804f", 700: "#1d6741", 800: "#185236", 900: "#14432d", 950: "#0b2a1c" } },
  senja: { nama: "Senja", palet: { 50: "#fdf5f1", 100: "#fbe6dc", 500: "#d9693f", 600: "#bf5330", 700: "#9e4228", 800: "#7f3624", 900: "#682e21", 950: "#3d170f" } },
  anggur: { nama: "Anggur", palet: { 50: "#f8f4fb", 100: "#efe5f6", 500: "#8a4fb8", 600: "#743e9e", 700: "#5f3381", 800: "#4e2c69", 900: "#412656", 950: "#271235" } },
  arang: { nama: "Arang", palet: { 50: "#f5f6f7", 100: "#e6e8eb", 500: "#5b6573", 600: "#4a535f", 700: "#3c434e", 800: "#2f353e", 900: "#24292f", 950: "#14171b" } },
};

/** Style CSS yang menimpa warna laut-* sesuai tema trip. */
export function gayaTema(tema: Tema | undefined): React.CSSProperties {
  const p = TEMA[tema ?? "laut"]?.palet ?? TEMA.laut.palet;
  return Object.fromEntries(Object.entries(p).map(([k, v]) => [`--color-laut-${k}`, v])) as React.CSSProperties;
}
