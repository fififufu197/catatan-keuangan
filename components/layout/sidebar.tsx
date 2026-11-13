"use client";

import {
  ArrowLeftRight,
  BarChart3,
  LayoutDashboard,
  Settings,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { APP_NAME, NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  "/dashboard": LayoutDashboard,
  "/transaksi": ArrowLeftRight,
  "/anggaran": Wallet,
  "/laporan": BarChart3,
  "/pengaturan": Settings,
};

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col gap-7 p-4">
      <Link
        href="/dashboard"
        onClick={onNavigate}
        className="flex items-center gap-2.5 rounded-xl px-2 py-1"
      >
        <span className="bg-brand text-brand-foreground flex size-8 shrink-0 items-center justify-center rounded-xl shadow-[0_6px_16px_-8px_var(--brand)]">
          <Wallet className="size-4" aria-hidden />
        </span>
        <span className="text-sm leading-tight font-semibold tracking-tight">
          {APP_NAME}
        </span>
      </Link>

      <nav className="flex flex-col gap-1" aria-label="Navigasi utama">
        {NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.href] ?? LayoutDashboard;
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-foreground text-background font-medium shadow-[0_10px_24px_-18px_var(--foreground)]"
                  : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
              )}
            >
              <Icon className="size-4" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl border border-sidebar-border/70 bg-background/50 p-3.5">
        <p className="text-xs font-medium">Catatan aman</p>
        <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed">
          Data hanya bisa diakses akun Anda. Unduh CSV tiap akhir bulan untuk
          cadangan.
        </p>
      </div>
    </div>
  );
}
