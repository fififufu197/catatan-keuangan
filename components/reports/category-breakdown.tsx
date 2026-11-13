import { CategoryDonut } from "@/components/dashboard/category-donut";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CategoryTotal } from "@/lib/types";

export function CategoryBreakdown({
  data,
  description,
}: {
  data: CategoryTotal[];
  description: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pengeluaran per Kategori</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-muted-foreground py-10 text-center text-sm">
            Belum ada pengeluaran pada periode ini.
          </p>
        ) : (
          <CategoryDonut data={data} />
        )}
      </CardContent>
    </Card>
  );
}
