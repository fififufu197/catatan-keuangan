import type {
  PaymentMethod,
  ReportTab,
  TransactionKind,
} from "@/lib/types";

export const APP_NAME = "Catatan Keuangan";

/** Jumlah baris per halaman daftar transaksi. */
export const PAGE_SIZE = 25;

export const MAX_AMOUNT = 999_999_999_999;
export const MIN_YEAR = 2000;
export const MAX_YEAR = 2100;

export const MAX_DESCRIPTION_LENGTH = 200;
export const MAX_CATEGORY_NAME_LENGTH = 40;
export const MAX_FULL_NAME_LENGTH = 80;
export const MIN_PASSWORD_LENGTH = 8;

export const TRANSACTION_KINDS: TransactionKind[] = ["income", "expense"];

export const KIND_LABELS: Record<TransactionKind, string> = {
  income: "Pemasukan",
  expense: "Pengeluaran",
};

export const PAYMENT_METHODS: PaymentMethod[] = [
  "cash",
  "bank_transfer",
  "e_wallet",
  "other",
];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Tunai",
  bank_transfer: "Transfer Bank",
  e_wallet: "E-Wallet",
  other: "Lainnya",
};

export const REPORT_TABS: { value: ReportTab; label: string }[] = [
  { value: "harian", label: "Harian" },
  { value: "bulanan", label: "Bulanan" },
  { value: "tahunan", label: "Tahunan" },
];

export const SORT_OPTIONS = [
  { value: "terbaru", label: "Terbaru" },
  { value: "terlama", label: "Terlama" },
  { value: "nominal", label: "Nominal terbesar" },
] as const;

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/transaksi", label: "Transaksi" },
  { href: "/anggaran", label: "Anggaran" },
  { href: "/laporan", label: "Laporan" },
  { href: "/pengaturan", label: "Pengaturan" },
] as const;

/** Ambang warna progres anggaran (persen). */
export const BUDGET_THRESHOLDS = {
  warning: 80,
  danger: 100,
} as const;

/** Batas rentang tanggal transaksi, sama dengan CHECK di database. */
export const DATE_MIN = "2000-01-01";
export const DATE_MAX = "2100-12-31";
