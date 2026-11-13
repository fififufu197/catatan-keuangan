import { MAX_YEAR, MIN_YEAR } from "@/lib/constants";
import type { Period } from "@/lib/types";

/** Semua perhitungan "hari ini" memakai zona waktu Indonesia Barat. */
export const TIME_ZONE = "Asia/Jakarta";

export type DateRange = {
  from: string;
  to: string;
};

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** Tanggal hari ini di Asia/Jakarta dalam format `YYYY-MM-DD`. */
export function todayWib(): string {
  // en-CA menghasilkan format YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Bulan berjalan menurut Asia/Jakarta. */
export function currentPeriodWib(): Period {
  const [year, month] = todayWib().split("-").map(Number);
  return { year, month };
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function isValidYear(year: number): boolean {
  return Number.isInteger(year) && year >= MIN_YEAR && year <= MAX_YEAR;
}

export function isValidMonth(month: number): boolean {
  return Number.isInteger(month) && month >= 1 && month <= 12;
}

/** Validasi `YYYY-MM-DD` termasuk tanggal yang benar-benar ada. */
export function isValidDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);

  if (!isValidYear(year) || !isValidMonth(month)) {
    return false;
  }

  if (day < 1 || day > daysInMonth(year, month)) {
    return false;
  }

  return true;
}

/** Rentang inklusif satu bulan. */
export function rentangBulan(year: number, month: number): DateRange {
  return {
    from: `${year}-${pad(month)}-01`,
    to: `${year}-${pad(month)}-${pad(daysInMonth(year, month))}`,
  };
}

/** Rentang inklusif satu tahun. */
export function rentangTahun(year: number): DateRange {
  return {
    from: `${year}-01-01`,
    to: `${year}-12-31`,
  };
}

/** Rentang inklusif satu hari (from = to). */
export function rentangHari(date: string): DateRange {
  return { from: date, to: date };
}

/**
 * Menentukan periode dari query string; nilai tidak sah diganti bulan berjalan.
 * Dipakai dashboard, anggaran, dan laporan.
 */
export function resolvePeriod(
  tahun?: string | null,
  bulan?: string | null,
): Period {
  const fallback = currentPeriodWib();
  const year = Number(tahun);
  const month = Number(bulan);

  return {
    year: isValidYear(year) ? year : fallback.year,
    month: isValidMonth(month) ? month : fallback.month,
  };
}

/** Mengambil tahun dari query string, fallback ke tahun berjalan WIB. */
export function resolveYear(tahun?: string | null): number {
  const year = Number(tahun);
  return isValidYear(year) ? year : currentPeriodWib().year;
}

/** Mengambil tanggal dari query string, fallback ke hari ini WIB. */
export function resolveDate(tanggal?: string | null): string {
  return tanggal && isValidDateString(tanggal) ? tanggal : todayWib();
}
