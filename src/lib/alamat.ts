/** Alamat aplikasi yang sudah online. Dipakai untuk link yang dibagikan, supaya tidak berisi localhost. */
export const ALAMAT_PRODUKSI = "https://demo-trip-two.vercel.app";

/** Alamat dasar untuk link: alamat produksi bila dibuka dari localhost, selain itu alamat tempat aplikasi dibuka. */
export const alamatDasar = () => (typeof window !== "undefined" && window.location.hostname !== "localhost" ? window.location.origin : ALAMAT_PRODUKSI);
