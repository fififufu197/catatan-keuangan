import { cn } from "@/lib/utils";
import { formatPersen } from "@/lib/format";

export function BudgetProgress({ percentage }: { percentage: number }) {
  const status =
    percentage >= 100 ? "danger" : percentage >= 80 ? "warning" : "normal";

  const labels = {
    normal: "Aman",
    warning: "Mendekati batas",
    danger: "Melewati anggaran",
  } as const;

  const barClass = {
    normal: "bg-income",
    warning: "bg-amber-500",
    danger: "bg-expense",
  } as const;

  const textClass = {
    normal: "text-muted-foreground",
    warning: "text-amber-600 dark:text-amber-400",
    danger: "text-expense",
  } as const;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className={textClass[status]}>{labels[status]}</span>
        <span className={cn("font-medium tabular-nums", textClass[status])}>
          {formatPersen(percentage)}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percentage)}
        aria-label={`Penggunaan anggaran ${formatPersen(percentage)}`}
        className="bg-muted h-2 w-full overflow-hidden rounded-full"
      >
        <div
          className={cn("h-full rounded-full transition-all", barClass[status])}
          style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }}
        />
      </div>
    </div>
  );
}
