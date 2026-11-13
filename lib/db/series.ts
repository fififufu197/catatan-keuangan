import type { DateRange } from "@/lib/period";
import type { DailyPoint, MonthlyPoint } from "@/lib/types";

/** Lengkapi tanggal yang tidak punya transaksi dengan nilai nol. */
export function fillDailySeries(
  points: DailyPoint[],
  range: DateRange,
): DailyPoint[] {
  const map = new Map(points.map((point) => [point.day, point]));
  const result: DailyPoint[] = [];

  const cursor = new Date(`${range.from}T00:00:00Z`);
  const end = new Date(`${range.to}T00:00:00Z`);

  while (cursor <= end) {
    const day = cursor.toISOString().slice(0, 10);
    const point = map.get(day);
    result.push(point ?? { day, income: 0, expense: 0 });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return result;
}

/** Lengkapi 12 bulan dengan nilai nol bila tidak ada transaksi. */
export function fillMonthlySeries(
  points: MonthlyPoint[],
): MonthlyPoint[] {
  const map = new Map(points.map((point) => [point.month, point]));

  return Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const point = map.get(month);

    return point ?? { month, income: 0, expense: 0 };
  });
}
