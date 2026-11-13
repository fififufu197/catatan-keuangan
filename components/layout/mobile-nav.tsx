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

import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  "/dashboard": LayoutDashboard,
  "/transaksi": ArrowLeftRight,
  "/anggaran": Wallet,
  "/laporan": BarChart3,
  "/pengaturan": Settings,
};

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi bawah"
      className="bg-background/80 supports-[backdrop-filter]:bg-background/65 fixed inset-x-0 bottom-0 z-30 flex border-t border-border/60 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
    >
      {NAV_ITEMS.map((item) => {
        const Icon = ICONS[item.href] ?? LayoutDashboard;
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className="flex flex-1 flex-col items-center gap-1 pt-2 pb-2"
          >
            <span
              className={cn(
                "flex h-8 w-12 items-center justify-center rounded-full transition-colors",
                active
                  ? "bg-foreground text-background"
                  : "text-muted-foreground",
              )}
            >
              <Icon className="size-[18px]" aria-hidden />
            </span>
            <span
              className={cn(
                "text-[10px] leading-none",
                active ? "text-foreground font-medium" : "text-muted-foreground",
              )}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
