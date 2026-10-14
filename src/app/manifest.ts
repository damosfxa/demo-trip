import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Info Trip",
    short_name: "Info Trip",
    description: "Jadwal, kartu peserta, dan info perjalanan rombongan.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#0369a1",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
