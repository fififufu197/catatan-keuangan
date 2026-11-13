"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { formatPersen, formatRupiah } from "@/lib/format";
import type { CategoryTotal } from "@/lib/types";

const COLORS = [
  "#f1370f",
  "#2b23c3",
  "#0e7a4e",
  "#c2b6a9",
  "#4c4960",
  "#ff8a5c",
  "#6f66ff",
  "#3ecf8e",
  "#a99a88",
  "#8d88a3",
];

export function CategoryDonut({ data }: { data: CategoryTotal[] }) {
  const total = data.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="space-y-4">
      <div className="relative h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="name"
              innerRadius="60%"
              outerRadius="88%"
              paddingAngle={2}
              stroke="var(--card)"
              strokeWidth={2}
            >
              {data.map((item, index) => (
                <Cell
                  key={item.categoryId}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                color: "var(--popover-foreground)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                fontSize: 12,
              }}
              formatter={(value) => formatRupiah(Number(value))}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-muted-foreground text-xs">Total</span>
          <span className="text-sm font-semibold tabular-nums">
            {formatRupiah(total)}
          </span>
        </div>
      </div>

      <ul className="space-y-2">
        {data.map((item, index) => {
          const percentage = total > 0 ? (item.total / total) * 100 : 0;

          return (
            <li
              key={item.categoryId}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor: COLORS[index % COLORS.length],
                  }}
                  aria-hidden
                />
                <span className="truncate">{item.name}</span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <span className="tabular-nums">
                  {formatRupiah(item.total)}
                </span>
                <span className="text-muted-foreground w-12 text-right text-xs tabular-nums">
                  {formatPersen(percentage)}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
