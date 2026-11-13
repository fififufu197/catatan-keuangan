"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { REPORT_TABS } from "@/lib/constants";
import type { ReportTab } from "@/lib/types";

export function ReportTabs({ tab }: { tab: ReportTab }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function changeTab(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Tabs value={tab} onValueChange={changeTab}>
      <TabsList variant="line" className="w-full sm:w-fit">
        {REPORT_TABS.map((item) => (
          <TabsTrigger key={item.value} value={item.value} className="flex-1">
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
