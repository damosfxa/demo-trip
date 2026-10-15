import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Info Trip",
    short_name: "Info Trip",
    description: "Jadwal, kartu peserta, dan info perjalanan rombongan. Bisa dipasang di layar HP dan dibuka tanpa sinyal.",
    lang: "id",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    categories: ["travel", "productivity"],
    background_color: "#062a3d",
    theme_color: "#0a3a52",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
