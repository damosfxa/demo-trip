"use client";

import { useEffect, useRef } from "react";
import type { Trip } from "@/lib/types";
import { Pemandangan, suasanaDari } from "../Pemandangan";

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

  return (
    <div className={`relative ${tinggi} overflow-hidden bg-laut-900`}>
      <div ref={latar} className="absolute inset-0 will-change-transform">
        {trip.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={trip.cover_url} alt="" className="anim-zoom h-full w-full object-cover" />
        ) : (
          <Pemandangan suasana={suasana} className="h-full w-full" />
        )}
      </div>
      {/* Lapisan gelap di bawah supaya teks selalu terbaca */}
      <div className="absolute inset-x-0 bottom-0 h-3/5 bg-laut-950/55 [mask-image:linear-gradient(to_top,black_40%,transparent)]" />
      {trip.logo_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={trip.logo_url} alt={trip.penyelenggara ?? "Logo"} className="anim-pudar absolute left-4 top-4 h-10 max-w-[9rem] rounded-xl bg-white/95 object-contain p-1.5 shadow-sm" />
      )}
      <div className="relative flex h-full flex-col justify-end px-5 pb-14 text-white">{children}</div>
    </div>
  );
}
