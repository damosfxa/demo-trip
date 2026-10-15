"use client";

import { useEffect, useRef } from "react";
import type { Trip } from "@/lib/types";
import { Pemandangan, jamPecahan, suasanaDari } from "../Pemandangan";
import { teksCuaca, useCuaca } from "@/lib/cuaca";
import { useLatar } from "@/lib/lokasi";

/** Jam (0-23) di zona waktu trip, untuk memilih suasana siang, senja, atau malam. */
function jamDi(zona: string, waktu: number) {
  return Number(new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hour12: false, timeZone: zona }).format(new Date(waktu || Date.now())));
}

/** Sampul atas: foto trip (bila ada) atau ilustrasi bergerak, dengan efek parallax saat digulir. */
export function Hero({ trip, sekarang, tinggi = "h-[22rem]", children }: { trip: Trip; sekarang: number; tinggi?: string; children: React.ReactNode }) {
  const latar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = latar.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const gulir = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, 400);
        el.style.transform = `translateY(${y * 0.35}px) scale(${1 + y / 2000})`;
      });
    };
    window.addEventListener("scroll", gulir, { passive: true });
    return () => {
      window.removeEventListener("scroll", gulir);
      cancelAnimationFrame(raf);
    };
  }, []);

  const suasana = suasanaDari(jamDi(trip.zona, sekarang));
  const cuaca = useCuaca(trip.zona, trip.lat, trip.lon);
  // Tanpa foto sampul, latar gunung diambil dari foto asli lokasi trip.
  const fotoGunung = useLatar(trip.cover_url ? null : trip.lokasi_nama ? `${trip.lokasi_nama} mountains` : "mountain landscape");
  // Seberapa dekat dengan matahari terbit atau terbenam (0 jauh, 1 tepat di waktunya), untuk menghaluskan warna.
  const jamSekarang = jamPecahan(trip.zona, sekarang);
  const terbit = cuaca?.terbit ?? 5.5;
  const terbenam = cuaca?.terbenam ?? 18.5;
  const senja = Math.max(0, 1 - Math.min(Math.abs(jamSekarang - terbit), Math.abs(jamSekarang - terbenam)) / 1.2);

  return (
    <div className={`relative ${tinggi} overflow-hidden bg-laut-900`}>
      <div ref={latar} className="absolute inset-0 will-change-transform">
        {trip.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={trip.cover_url} alt="" className="anim-zoom h-full w-full object-cover" />
        ) : (
          <Pemandangan suasana={suasana} jam={jamPecahan(trip.zona, sekarang)} cuaca={cuaca} latar={fotoGunung} className="h-full w-full" />
        )}
      </div>
      {/* Lapisan gelap di bawah supaya teks selalu terbaca */}
      <div className="absolute inset-x-0 bottom-0 h-3/5 bg-laut-950/55 transition-opacity duration-[2000ms] [mask-image:linear-gradient(to_top,black_40%,transparent)]" style={{ opacity: 1 - senja * 0.5 }} />
      {/* Sentuhan hangat saat fajar dan senja, dibuat lembut dengan mode blend */}
      <div className="absolute inset-0 transition-opacity duration-[2000ms] mix-blend-soft-light" style={{ opacity: senja * 0.7, background: "linear-gradient(to bottom, rgba(255,190,140,0.6), rgba(240,120,130,0.35) 55%, rgba(60,40,80,0.2))" }} />
      {trip.logo_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={trip.logo_url} alt={trip.penyelenggara ?? "Logo"} className="absolute left-4 top-4 h-10 max-w-[9rem] rounded-xl bg-white/95 object-contain p-1.5 shadow-sm" />
      )}
      {cuaca && (
        <span className="absolute right-4 top-4 rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
          {teksCuaca(cuaca.kode)} · {cuaca.suhu}°C
        </span>
      )}
      <div className="relative flex h-full flex-col justify-end px-5 pb-14 text-white">{children}</div>
    </div>
  );
}
