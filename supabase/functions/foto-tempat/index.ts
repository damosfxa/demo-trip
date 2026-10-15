// Edge Function: mencari foto asli sebuah tempat di Unsplash. Secret yang dibutuhkan: UNSPLASH_ACCESS_KEY.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const jawab = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return jawab({ error: "Metode tidak didukung." }, 405);
  const { query } = (await req.json().catch(() => ({}))) as { query?: unknown };
  if (typeof query !== "string" || query.trim().length < 2 || query.length > 120) return jawab({ error: "Nama tempat tidak valid." }, 400);

  const kunci = Deno.env.get("UNSPLASH_ACCESS_KEY");
  if (!kunci) return jawab({ error: "Layanan foto belum diatur." }, 503);
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;
  const res = await fetch(url, { headers: { Authorization: `Client-ID ${kunci}`, "Accept-Version": "v1" } });
  if (!res.ok) return jawab({ error: "Foto tidak bisa diambil." }, 502);
  const json = (await res.json()) as { results: { urls: { regular: string } }[] };
  const foto = json.results?.[0]?.urls?.regular;
  if (!foto) return jawab({ foto: null });
  return jawab({ foto });
});
