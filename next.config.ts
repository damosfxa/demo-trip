import type { NextConfig } from "next";

// Diekspor sebagai file statis, jadi bisa diunggah ke hosting biasa mana pun (cPanel, Vercel, Netlify).
// Datanya diambil langsung dari Supabase di browser.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
};

export default nextConfig;
