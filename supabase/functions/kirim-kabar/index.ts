// Edge Function: kirim notifikasi HP (Web Push) ke peserta trip.
// Dipanggil panitia (owner) setelah menulis pengumuman publik atau pesan pribadi.
// Body: { trip_id: string, participant_id?: string | null, judul: string, isi: string, url?: string }
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.109.0";
import webpush from "npm:web-push@3.6.7";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const jawab = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return jawab({ error: "Metode tidak didukung." }, 405);

  const url = Deno.env.get("SUPABASE_URL")!;
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });

  // Pastikan pemanggil adalah panitia dengan peran owner.
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data: userData, error: errUser } = await admin.auth.getUser(token);
  if (errUser || !userData.user) return jawab({ error: "Belum login." }, 401);
  const { data: staf } = await admin.from("staff").select("role").eq("user_id", userData.user.id).maybeSingle();
  if (staf?.role !== "owner") return jawab({ error: "Hanya panitia utama yang bisa mengirim notifikasi." }, 403);

  let body: { trip_id?: string; participant_id?: string | null; judul?: string; isi?: string; url?: string };
  try {
    body = await req.json();
  } catch {
    return jawab({ error: "Format permintaan salah." }, 400);
  }
  if (!body.trip_id || !body.isi) return jawab({ error: "trip_id dan isi wajib." }, 400);

  const { data: bahan, error: errBahan } = await admin.rpc("bahan_kirim_notifikasi", { p_trip: body.trip_id, p_peserta: body.participant_id ?? null });
  if (errBahan || !bahan?.privat) return jawab({ error: "Pengaturan notifikasi belum lengkap." }, 500);

  webpush.setVapidDetails("https://rizkyrhamadani.com", bahan.publik, bahan.privat);
  const muatan = JSON.stringify({
    judul: (body.judul ?? "Info Trip").slice(0, 80),
    isi: body.isi.slice(0, 300),
    url: body.url ?? "/",
  });

  const langganan = (bahan.langganan ?? []) as { endpoint: string; p256dh: string; auth: string }[];
  const mati: string[] = [];
  let terkirim = 0;
  await Promise.all(
    langganan.map(async (l) => {
      try {
        await webpush.sendNotification({ endpoint: l.endpoint, keys: { p256dh: l.p256dh, auth: l.auth } }, muatan, { TTL: 60 * 60 * 24 });
        terkirim++;
      } catch (e) {
        const kode = (e as { statusCode?: number }).statusCode;
        // 404/410: langganan sudah tidak berlaku (aplikasi dihapus atau izin dicabut).
        if (kode === 404 || kode === 410) mati.push(l.endpoint);
      }
    }),
  );
  if (mati.length) await admin.rpc("hapus_langganan_mati", { p_endpoints: mati });

  return jawab({ terkirim, total: langganan.length });
});
