import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { DaftarkanSw } from "@/components/DaftarkanSw";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], display: "swap", variable: "--font-jakarta" });

// Judul dan deskripsi ini yang muncul di pratinjau link saat dikirim lewat WhatsApp
const judul = "Info Trip: registrasi dan info perjalanan peserta";
const deskripsi = "Peserta registrasi dari HP, lalu melihat jadwal, kartu peserta, bus, kamar, dan pengumuman. Panitia mengelola peserta dan absensi scan QR.";

export const metadata: Metadata = {
  title: judul,
  description: deskripsi,
  applicationName: "Info Trip",
  appleWebApp: { capable: true, title: "Info Trip", statusBarStyle: "default" },
  icons: { icon: "/icon-192.png", apple: "/icon-192.png" },
  openGraph: { title: judul, description: deskripsi, type: "website", locale: "id_ID" },
};

export const viewport: Viewport = { themeColor: "#0a3a52", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body className={`${jakarta.variable} min-h-dvh font-sans text-slate-900 antialiased`}>
        <main className="mx-auto w-full max-w-md overflow-x-clip">{children}</main>
        <DaftarkanSw />
      </body>
    </html>
  );
}
