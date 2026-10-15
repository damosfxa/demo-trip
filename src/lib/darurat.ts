/**
 * Pengumuman darurat disimpan sebagai pengumuman biasa dengan penanda di depan isinya.
 * Dipakai supaya tidak perlu mengubah skema database. Peserta melihatnya sebagai banner di bagian atas.
 */
export const PENANDA_DARURAT = "[DARURAT] ";

export function pisahDarurat(isi: string) {
  const darurat = isi.startsWith(PENANDA_DARURAT);
  return { darurat, isi: darurat ? isi.slice(PENANDA_DARURAT.length) : isi };
}
