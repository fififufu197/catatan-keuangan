import { Skeleton } from "@/components/ui/skeleton";

export default function AnggaranLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-[9.5rem]" />
          <Skeleton className="h-9 w-[7.5rem]" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-[104px] rounded-xl" />
        ))}
      </div>

      <Skeleton className="h-[420px] rounded-xl" />
    </div>
  );
}
