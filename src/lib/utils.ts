export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function initials(name?: string | null, fallback = "A") {
  if (!name) return fallback;
  const parts = name.trim().split(/\s+/).slice(0, 2);
  const value = parts.map((p) => p[0]).join("").toUpperCase();
  return value || fallback;
}

const MESI = [
  "gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno",
  "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre",
];
const MESI_BREVI = [
  "gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic",
];

/** Data in italiano, senza dipendere dalle impostazioni locali del server. */
export function formatDateIt(iso?: string | null, short = false) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const mesi = short ? MESI_BREVI : MESI;
  return `${d.getDate()} ${mesi[d.getMonth()]} ${d.getFullYear()}`;
}

export function timeAgo(iso?: string | null) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "adesso";
  if (min < 60) return `${min} min fa`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} h fa`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} g fa`;
  return formatDateIt(iso, true);
}

/**
 * Formattazione italiana dei numeri, scritta a mano di proposito:
 * toLocaleString dà risultati diversi fra server e browser e romperebbe
 * l'aggancio della pagina (hydration).
 */
export function formatCount(n: number) {
  if (n < 1_000_000) {
    return String(Math.trunc(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  const mln = (n / 1_000_000).toFixed(1).replace(".", ",");
  return `${mln.endsWith(",0") ? mln.slice(0, -2) : mln} mln`;
}

export function detectMediaType(file: File): "image" | "video" | "gif" {
  if (file.type === "image/gif") return "gif";
  if (file.type.startsWith("video/")) return "video";
  return "image";
}

/** Normalizza un handle social: accetta @nome, nome, o l'URL completo. */
export function normalizeHandle(raw: string | null | undefined) {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const fromUrl = trimmed.match(/(?:instagram|facebook)\.com\/([^/?#]+)/i);
  if (fromUrl) return fromUrl[1];
  return trimmed.replace(/^@/, "");
}

export function socialUrl(network: "instagram" | "facebook", handle: string) {
  return `https://www.${network}.com/${handle}`;
}
