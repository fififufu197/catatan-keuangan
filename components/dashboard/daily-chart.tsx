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

import { formatRingkas, formatRupiah, formatTanggal } from "@/lib/format";
import type { DailyPoint } from "@/lib/types";

export function DailyChart({ data }: { data: DailyPoint[] }) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="var(--border)"
          />
          <XAxis
            dataKey="day"
            tickFormatter={(value: string) => String(Number(value.slice(8, 10)))}
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
              borderRadius: 8,
              fontSize: 12,
            }}
            labelFormatter={(label) => formatTanggal(String(label))}
            formatter={(value) => formatRupiah(Number(value))}
          />
          <Legend
            verticalAlign="top"
            height={28}
            iconType="circle"
            wrapperStyle={{ fontSize: 12 }}
          />
          <Bar
            dataKey="income"
            name="Pemasukan"
            fill="var(--income)"
            radius={[4, 4, 0, 0]}
            maxBarSize={18}
          />
          <Bar
            dataKey="expense"
            name="Pengeluaran"
            fill="var(--expense)"
            radius={[4, 4, 0, 0]}
            maxBarSize={18}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
