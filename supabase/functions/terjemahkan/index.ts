// Edge Function: menerjemahkan isi trip dari Indonesia ke English lewat DeepL, dengan cache di tabel terjemahan.
// Secret yang dibutuhkan: DEEPL_API_KEY. Opsional: DEEPL_API_URL (default paket gratis).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.109.0";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const jawab = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

async function sidikJari(teks: string) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(teks));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return jawab({ error: "Metode tidak didukung." }, 405);

  const { texts } = (await req.json().catch(() => ({}))) as { texts?: unknown };
  if (!Array.isArray(texts) || texts.length === 0 || texts.length > 50) return jawab({ error: "Daftar teks tidak valid." }, 400);
  const daftar = [...new Set(texts.filter((t): t is string => typeof t === "string" && t.trim() !== "" && t.length <= 1000))];

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  const hasil: Record<string, string> = {};
  const sidik = new Map<string, string>();
  for (const t of daftar) sidik.set(await sidikJari(t), t);

  // 1. Ambil yang sudah ada di cache.
  const { data: ada } = await admin.from("terjemahan").select("sumber_hash, sumber, isi_en").in("sumber_hash", [...sidik.keys()]);
  for (const r of ada ?? []) hasil[r.sumber] = r.isi_en;

  // 2. Terjemahkan sisanya lewat DeepL.
  const kurang = daftar.filter((t) => !(t in hasil));
  if (kurang.length) {
    const kunci = Deno.env.get("DEEPL_API_KEY");
    if (!kunci) return jawab({ error: "Layanan terjemahan belum diatur." }, 503);
    const url = Deno.env.get("DEEPL_API_URL") ?? "https://api-free.deepl.com/v2/translate";
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `DeepL-Auth-Key ${kunci}`, "Content-Type": "application/json" },
      body: JSON.stringify({ text: kurang, source_lang: "ID", target_lang: "EN-US" }),
    });
    if (!res.ok) return jawab({ error: "Terjemahan gagal, tampilkan teks asli." }, 502);
    const json = (await res.json()) as { translations: { text: string }[] };
    const baru = kurang.map((t, i) => ({ sumber_hash: "", sumber: t, isi_en: json.translations[i]?.text ?? t }));
    for (const b of baru) {
      b.sumber_hash = await sidikJari(b.sumber);
      hasil[b.sumber] = b.isi_en;
    }
    await admin.from("terjemahan").upsert(baru, { onConflict: "sumber_hash" });
  }
  return jawab({ hasil });
});
