const LOCALE = "id-ID";
const TIME_ZONE = "UTC";

const numberFormatter = new Intl.NumberFormat(LOCALE, {
  maximumFractionDigits: 0,
});

/**
 * Format uang tanpa desimal: `formatRupiah(1000000)` → `"Rp1.000.000"`.
 * Nominal negatif menjadi `"-Rp5.000"`.
 */
export function formatRupiah(amount: number): string {
  const rounded = Math.round(amount);
  const sign = rounded < 0 ? "-" : "";

  return `${sign}Rp${numberFormatter.format(Math.abs(rounded))}`;
}

/**
 * Format tanggal `YYYY-MM-DD` tanpa pergeseran zona waktu.
 * `formatTanggal("2026-11-13")` → `"13 November 2026"`.
 */
export function formatTanggal(
  isoDate: string,
  options: { pendek?: boolean } = {},
): string {
  const date = new Date(`${isoDate}T00:00:00Z`);

  return new Intl.DateTimeFormat(LOCALE, {
    day: "numeric",
    month: options.pendek ? "short" : "long",
    year: "numeric",
    timeZone: TIME_ZONE,
  }).format(date);
}

/** `formatBulan(2026, 11)` → `"November 2026"`. */
export function formatBulan(
  year: number,
  month: number,
  options: { pendek?: boolean } = {},
): string {
  const date = new Date(Date.UTC(year, month - 1, 1));

  return new Intl.DateTimeFormat(LOCALE, {
    month: options.pendek ? "short" : "long",
    year: "numeric",
    timeZone: TIME_ZONE,
  }).format(date);
}

/** Nama bulan saja: `formatNamaBulan(11, { pendek: true })` → `"Nov"`. */
export function formatNamaBulan(
  month: number,
  options: { pendek?: boolean } = {},
): string {
  const date = new Date(Date.UTC(2020, month - 1, 1));

  return new Intl.DateTimeFormat(LOCALE, {
    month: options.pendek ? "short" : "long",
    timeZone: TIME_ZONE,
  }).format(date);
}

/**
 * Format persen dengan satu angka desimal bila perlu.
 * `formatPersen(83.33)` → `"83,3%"`.
 */
export function formatPersen(value: number, digits = 1): string {
  return `${new Intl.NumberFormat(LOCALE, {
    maximumFractionDigits: digits,
  }).format(value)}%`;
}

/**
 * Nominal ringkas untuk sumbu grafik: `Rp250 rb`, `Rp1,5 jt`, `Rp2 M`.
 */
export function formatRingkas(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";

  const units = [
    { value: 1_000_000_000_000, suffix: " T" },
    { value: 1_000_000_000, suffix: " M" },
    { value: 1_000_000, suffix: " jt" },
    { value: 1_000, suffix: " rb" },
  ] as const;

  const unit = units.find((item) => abs >= item.value);

  if (!unit) {
    return `${sign}Rp${numberFormatter.format(abs)}`;
  }

  const scaled = abs / unit.value;
  const formatted = new Intl.NumberFormat(LOCALE, {
    maximumFractionDigits: 1,
  })
    .format(scaled)
    .replace(",0", "");

  return `${sign}Rp${formatted}${unit.suffix}`;
}

/** Angka biasa dengan pemisah ribuan: `formatAngka(1250)` → `"1.250"`. */
export function formatAngka(value: number): string {
  return numberFormatter.format(value);
}
