import { formatRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PeriodSummary } from "@/lib/types";

export function BalanceOverview({
  balance,
  summary,
  periodLabel,
}: {
  balance: number;
  summary: PeriodSummary;
  periodLabel: string;
}) {
  const difference = summary.income - summary.expense;

  const stats = [
    {
      label: "Pemasukan",
      value: summary.income,
      tone: "text-[#54d99b]",
    },
    {
      label: "Pengeluaran",
      value: summary.expense,
      tone: "text-[#ff8a6a]",
    },
    {
      label: "Selisih",
      value: difference,
      tone: difference < 0 ? "text-[#ff8a6a]" : "text-cream",
    },
  ];

  return (
    <section className="ink-surface relative overflow-hidden rounded-[28px] shadow-[0_40px_90px_-70px_rgba(11,11,13,0.9)] ring-1 ring-cream/10">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="bg-brand/50 absolute -top-32 -right-24 size-[22rem] rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/4 size-[24rem] rounded-full bg-[#2b23c3]/45 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_10%_0%,rgba(255,255,255,0.09),transparent_45%)]" />
      </div>

      <div className="relative grid gap-8 p-6 xl:grid-cols-[1.05fr_0.95fr] xl:items-center xl:p-8">
        <div>
          <span className="text-cream/70 inline-flex items-center gap-2 rounded-full border border-cream/15 bg-cream/5 px-3 py-1 text-[10px] font-medium tracking-[0.18em] uppercase">
            <span className="bg-brand size-1.5 rounded-full" aria-hidden />
            Total saldo
          </span>

          <p
            className={cn(
              "mt-4 text-[clamp(1.55rem,8vw,2.5rem)] leading-none font-semibold tracking-[-0.035em] tabular-nums xl:text-[3rem]",
              balance < 0 && "text-[#ff8a6a]",
            )}
          >
            {formatRupiah(balance)}
          </p>

          <p className="text-cream/55 mt-3 max-w-xs text-sm">
            Akumulasi seluruh transaksi, tidak terpengaruh filter bulan.
          </p>

          <p className="text-cream/55 mt-4 text-xs">Periode {periodLabel}</p>
        </div>

        <dl className="grid gap-2.5 sm:grid-cols-3 xl:border-l xl:border-cream/10 xl:pl-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-cream/10 bg-cream/[0.06] px-4 py-3 backdrop-blur-sm"
            >
              <dt className="text-cream/55 text-[10px] font-medium tracking-[0.14em] uppercase">
                {stat.label}
              </dt>
              <dd
                className={cn(
                  "mt-1.5 text-base font-semibold tabular-nums",
                  stat.tone,
                )}
              >
                {formatRupiah(stat.value)}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
