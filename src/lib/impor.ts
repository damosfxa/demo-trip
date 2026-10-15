/** Membaca CSV sederhana: pemisah koma atau titik koma, mendukung tanda kutip dan baris pertama sebagai judul kolom. */
export function bacaCsv(teks: string): string[][] {
  const baris: string[][] = [];
  let sel = "";
  let isi: string[] = [];
  let dalamKutip = false;
  const bersih = teks.replace(/^﻿/, "");
  for (let i = 0; i < bersih.length; i++) {
    const c = bersih[i];
    if (dalamKutip) {
      if (c === '"' && bersih[i + 1] === '"') {
        sel += '"';
        i++;
      } else if (c === '"') dalamKutip = false;
      else sel += c;
    } else if (c === '"') dalamKutip = true;
    else if (c === "," || c === ";") {
      isi.push(sel.trim());
      sel = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && bersih[i + 1] === "\n") i++;
      isi.push(sel.trim());
      if (isi.some((x) => x !== "")) baris.push(isi);
      isi = [];
      sel = "";
    } else sel += c;
  }
  isi.push(sel.trim());
  if (isi.some((x) => x !== "")) baris.push(isi);
  return baris;
}

/** Nomor HP Indonesia dalam format 08..., atau null bila tidak valid. */
export function normalisasiHp(hp: string) {
  let d = hp.replace(/[^0-9]/g, "");
  if (d.startsWith("62")) d = "0" + d.slice(2);
  return /^08[0-9]{8,11}$/.test(d) ? d : null;
}
