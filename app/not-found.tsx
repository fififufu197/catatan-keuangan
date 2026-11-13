import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-muted-foreground text-sm font-medium">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">
        Halaman tidak ditemukan
      </h1>
      <p className="text-muted-foreground max-w-sm text-sm">
        Alamat yang kamu buka tidak tersedia atau sudah dipindahkan.
      </p>
      <Button asChild>
        <Link href="/dashboard">Kembali ke dashboard</Link>
      </Button>
    </main>
  );
}
