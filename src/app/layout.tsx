import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CatatanDemo } from "@/components/CatatanDemo";
import { Header } from "@/components/Header";
import { NavDemo } from "@/components/NavDemo";
import { ACARA } from "@/lib/acara";

const inter = Inter({ subsets: ["latin"], display: "swap" });

// Judul dan deskripsi ini yang muncul di pratinjau link saat dikirim lewat WhatsApp
const judul = `Demo Website Info Peserta | ${ACARA.nama}`;
const deskripsi = "Contoh demo, coba sendiri: peserta registrasi dari HP lalu melihat jadwal dan info perjalanan. Panitia melihat daftar peserta.";

export const metadata: Metadata = {
  title: judul,
  description: deskripsi,
  openGraph: { title: judul, description: deskripsi, type: "website", locale: "id_ID" },
};

export const viewport: Viewport = { themeColor: "#0369a1" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body className={`${inter.className} min-h-dvh bg-slate-50 text-slate-900 antialiased`}>
        <main className="mx-auto w-full max-w-md space-y-5 px-4 py-6">
          <Header />
          <NavDemo />
          {children}
          <CatatanDemo />
        </main>
      </body>
    </html>
  );
}
