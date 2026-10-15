// Ikon garis sederhana (tanpa paket tambahan).
type P = { className?: string };
const base = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, viewBox: "0 0 24 24" };

export const IkonRumah = ({ className = "h-5 w-5" }: P) => (<svg {...base} className={className}><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /></svg>);
export const IkonKalender = ({ className = "h-5 w-5" }: P) => (<svg {...base} className={className}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></svg>);
export const IkonKartu = ({ className = "h-5 w-5" }: P) => (<svg {...base} className={className}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3" /></svg>);
export const IkonInfo = ({ className = "h-5 w-5" }: P) => (<svg {...base} className={className}><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7.5v.01" /></svg>);
export const IkonLokasi = ({ className = "h-5 w-5" }: P) => (<svg {...base} className={className}><path d="M12 21s-7-6.2-7-12a7 7 0 0114 0c0 5.8-7 12-7 12z" /><circle cx="12" cy="9" r="2.5" /></svg>);
export const IkonWa = ({ className = "h-5 w-5" }: P) => (<svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18a8 8 0 01-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1112 20zm4.4-6c-.2-.1-1.4-.7-1.7-.8s-.4-.1-.5.1-.6.8-.8 1-.3.2-.5.1a6.6 6.6 0 01-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a.9.9 0 00-.7.3 2.8 2.8 0 00-.9 2.1 4.9 4.9 0 001 2.6 11.2 11.2 0 004.3 3.8c1.6.7 2.2.7 3 .6a2.6 2.6 0 001.7-1.2 2.1 2.1 0 00.1-1.2c0-.1-.2-.2-.4-.3z" /></svg>);
export const IkonCentang = ({ className = "h-4 w-4" }: P) => (<svg {...base} className={className}><path d="M5 12l5 5L20 7" /></svg>);
export const IkonBus = ({ className = "h-5 w-5" }: P) => <img src="/ikon/bus.svg" alt="" className={className} />;
export const IkonKasur = ({ className = "h-5 w-5" }: P) => <img src="/ikon/kamar.svg" alt="" className={className} />;
export const IkonSinyal = ({ className = "h-4 w-4" }: P) => (<svg {...base} className={className}><path d="M2 2l20 20M8.5 16.5a5 5 0 017 0M5 13a10 10 0 015.2-2.8M19 13a10 10 0 00-2.3-1.7M12 20h.01" /></svg>);
export const IkonPesawat = ({ className = "h-5 w-5" }: P) => (<svg {...base} className={className}><path d="M2 16l20-7-20-7 4 7-4 7zM6 9h7" /></svg>);
export const IkonToa = ({ className = "h-5 w-5" }: P) => (<svg {...base} className={className}><path d="M3 11v2a1 1 0 001 1h3l6 4V6L7 10H4a1 1 0 00-1 1zM16 9a4 4 0 010 6M19 6a8 8 0 010 12" /></svg>);
export const IkonJam = ({ className = "h-5 w-5" }: P) => (<svg {...base} className={className}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>);
export const IkonKoper = ({ className = "h-5 w-5" }: P) => <img src="/ikon/barang.svg" alt="" className={className} />;
export const IkonTanya = ({ className = "h-5 w-5" }: P) => (<svg {...base} className={className}><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 015 .5c0 1.5-2.5 2-2.5 3.5M12 17h.01" /></svg>);
export const IkonPasang = ({ className = "h-5 w-5" }: P) => (<svg {...base} className={className}><rect x="6" y="2" width="12" height="20" rx="2.5" /><path d="M12 7v7M9 11l3 3 3-3" /></svg>);
export const IkonPanah = ({ className = "h-4 w-4" }: P) => (<svg {...base} className={className}><path d="M9 6l6 6-6 6" /></svg>);
export const IkonOrang = ({ className = "h-5 w-5" }: P) => (<svg {...base} className={className}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0116 0" /></svg>);
export const IkonSegar = ({ className = "h-4 w-4" }: P) => (<svg {...base} className={className}><path d="M20 11a8 8 0 10-2.3 5.7M20 4v7h-7" /></svg>);

export const IkonBagi = ({ className = "h-5 w-5" }: P) => (<svg {...base} className={className}><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" /></svg>);
export const IkonUnduh = ({ className = "h-5 w-5" }: P) => (<svg {...base} className={className}><path d="M12 3v12M7 10l5 5 5-5" /><path d="M4 17v3h16v-3" /></svg>);
export const IkonSalin = ({ className = "h-5 w-5" }: P) => (<svg {...base} className={className}><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>);

export const IkonTelp = ({ className = "h-5 w-5" }: P) => (<svg {...base} className={className}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" /></svg>);
