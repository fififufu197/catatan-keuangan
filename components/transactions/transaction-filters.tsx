"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  KIND_LABELS,
  SORT_OPTIONS,
  TRANSACTION_KINDS,
} from "@/lib/constants";
import type {
  CategoryRow,
  TransactionKind,
  TransactionSort,
} from "@/lib/types";

const ALL = "semua";

export function TransactionFilters({
  categories,
  q,
  from,
  to,
  categoryId,
  kind,
  sort,
}: {
  categories: CategoryRow[];
  q: string;
  from: string;
  to: string;
  categoryId?: string;
  kind?: TransactionKind;
  sort: TransactionSort;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(q);

  function update(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }

    params.delete("halaman");

    const query = params.toString();
    router.push(query ? `/transaksi?${query}` : "/transaksi");
  }

  return (
    <div className="space-y-3">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          update({ q: search.trim() || undefined });
        }}
        className="relative"
      >
        <Search
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          aria-hidden
        />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari deskripsi transaksi…"
          className="pl-9"
          aria-label="Cari transaksi"
        />
        {search ? (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              update({ q: undefined });
            }}
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2 rounded p-1"
          >
            <X className="size-4" aria-hidden />
            <span className="sr-only">Hapus pencarian</span>
          </button>
        ) : null}
      </form>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <div className="space-y-1.5">
          <Label htmlFor="filter-dari" className="text-xs">
            Dari tanggal
          </Label>
          <Input
            id="filter-dari"
            type="date"
            value={from}
            min="2000-01-01"
            max="2100-12-31"
            onChange={(event) => update({ dari: event.target.value || undefined })}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="filter-sampai" className="text-xs">
            Sampai tanggal
          </Label>
          <Input
            id="filter-sampai"
            type="date"
            value={to}
            min="2000-01-01"
            max="2100-12-31"
            onChange={(event) => update({ sampai: event.target.value || undefined })}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Jenis</Label>
          <Select
            value={kind ?? ALL}
            onValueChange={(value) =>
              update({ jenis: value === ALL ? undefined : value })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Semua jenis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Semua jenis</SelectItem>
              {TRANSACTION_KINDS.map((value) => (
                <SelectItem key={value} value={value}>
                  {KIND_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Kategori</Label>
          <Select
            value={categoryId ?? ALL}
            onValueChange={(value) =>
              update({ kategori: value === ALL ? undefined : value })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Semua kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Semua kategori</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                  {category.archived ? " (diarsipkan)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Urutan</Label>
          <Select
            value={sort}
            onValueChange={(value) => update({ urut: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => router.push("/transaksi")}
        >
          Reset filter
        </Button>
      </div>
    </div>
  );
}
