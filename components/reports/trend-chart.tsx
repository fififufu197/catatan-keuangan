"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  formatBulan,
  formatNamaBulan,
  formatRingkas,
  formatRupiah,
  formatTanggal,
} from "@/lib/format";

export type TrendPoint = {
  label: string;
  income: number;
  expense: number;
};

export function TrendChart({
  points,
  mode,
}: {
  points: TrendPoint[];
  mode: "daily" | "monthly";
}) {
  function shortLabel(label: string): string {
    if (mode === "daily") {
      return String(Number(label.slice(8, 10)));
    }

    return formatNamaBulan(Number(label.slice(5, 7)), { pendek: true });
  }

  function fullLabel(label: string): string {
    if (mode === "daily") {
      return formatTanggal(label);
    }

    return formatBulan(Number(label.slice(0, 4)), Number(label.slice(5, 7)));
  }

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="var(--border)"
          />
          <XAxis
            dataKey="label"
            tickFormatter={shortLabel}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={12}
            fontSize={12}
          />
          <YAxis
            tickFormatter={(value: number) => formatRingkas(value)}
            tickLine={false}
            axisLine={false}
            width={70}
            fontSize={12}
          />
          <Tooltip
            cursor={{ fill: "var(--muted)", opacity: 0.4 }}
            contentStyle={{
              background: "var(--popover)",
              color: "var(--popover-foreground)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              fontSize: 12,
            }}
            labelFormatter={(label) => fullLabel(String(label))}
            formatter={(value) => formatRupiah(Number(value))}
          />
          <Legend
            verticalAlign="top"
            height={28}
            iconType="circle"
            wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }}
          />
          <Bar
            dataKey="income"
            name="Pemasukan"
            fill="var(--income)"
            radius={[6, 6, 0, 0]}
            maxBarSize={18}
          />
          <Bar
            dataKey="expense"
            name="Pengeluaran"
            fill="var(--expense)"
            radius={[6, 6, 0, 0]}
            maxBarSize={18}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
