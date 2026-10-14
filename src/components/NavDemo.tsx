"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Tab untuk berpindah antara sisi peserta dan sisi panitia (khusus demo).
export function NavDemo() {
  const path = usePathname();
  const panitia = path.startsWith("/panitia");
  const tab = (aktif: boolean) =>
    `flex-1 rounded-xl py-2.5 text-center text-sm font-semibold ${aktif ? "bg-white text-sky-800 shadow-sm" : "text-slate-500"}`;
  return (
    <nav className="flex gap-1 rounded-2xl bg-slate-200/70 p-1">
      <Link href="/" className={tab(!panitia)}>Peserta</Link>
      <Link href="/panitia" className={tab(panitia)}>Panitia</Link>
    </nav>
  );
}
