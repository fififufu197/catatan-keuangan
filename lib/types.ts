/** Jenis transaksi dan metode pembayaran, sama persis dengan enum Postgres. */
export type TransactionKind = "income" | "expense";
export type PaymentMethod = "cash" | "bank_transfer" | "e_wallet" | "other";

export type ProfileRow = {
  id: string;
  full_name: string;
  created_at: string;
  updated_at: string;
};

export type CategoryRow = {
  id: string;
  user_id: string;
  name: string;
  kind: TransactionKind;
  archived: boolean;
  created_at: string;
  updated_at: string;
};

export type TransactionRow = {
  id: string;
  user_id: string;
  category_id: string;
  kind: TransactionKind;
  amount: number;
  occurred_on: string;
  description: string;
  payment_method: PaymentMethod;
  created_at: string;
  updated_at: string;
};

export type BudgetRow = {
  id: string;
  user_id: string;
  category_id: string;
  kind: "expense";
  year: number;
  month: number;
  amount: number;
  created_at: string;
  updated_at: string;
};

type ProfileInsert = {
  id: string;
  full_name?: string;
  created_at?: string;
  updated_at?: string;
};

type ProfileUpdate = {
  id?: string;
  full_name?: string;
  created_at?: string;
  updated_at?: string;
};

type CategoryInsert = {
  id?: string;
  user_id: string;
  name: string;
  kind: TransactionKind;
  archived?: boolean;
  created_at?: string;
  updated_at?: string;
};

type CategoryUpdate = {
  id?: string;
  user_id?: string;
  name?: string;
  kind?: TransactionKind;
  archived?: boolean;
  created_at?: string;
  updated_at?: string;
};

type TransactionInsert = {
  id?: string;
  user_id: string;
  category_id: string;
  kind: TransactionKind;
  amount: number;
  occurred_on?: string;
  description?: string;
  payment_method?: PaymentMethod;
  created_at?: string;
  updated_at?: string;
};

type TransactionUpdate = {
  id?: string;
  user_id?: string;
  category_id?: string;
  kind?: TransactionKind;
  amount?: number;
  occurred_on?: string;
  description?: string;
  payment_method?: PaymentMethod;
  created_at?: string;
  updated_at?: string;
};

type BudgetInsert = {
  id?: string;
  user_id: string;
  category_id: string;
  kind?: "expense";
  year: number;
  month: number;
  amount: number;
  created_at?: string;
  updated_at?: string;
};

type BudgetUpdate = {
  id?: string;
  user_id?: string;
  category_id?: string;
  kind?: "expense";
  year?: number;
  month?: number;
  amount?: number;
  created_at?: string;
  updated_at?: string;
};

/**
 * Tipe database yang ditulis manual mengikuti `DATABASE_SCHEMA.md`.
 * Bila skema berubah, perbarui file ini bersamaan dengan migrasi.
 */
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      categories: {
        Row: CategoryRow;
        Insert: CategoryInsert;
        Update: CategoryUpdate;
        Relationships: [
          {
            foreignKeyName: "categories_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      transactions: {
        Row: TransactionRow;
        Insert: TransactionInsert;
        Update: TransactionUpdate;
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_category_fk";
            columns: ["category_id", "kind"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id", "kind"];
          },
        ];
      };
      budgets: {
        Row: BudgetRow;
        Insert: BudgetInsert;
        Update: BudgetUpdate;
        Relationships: [
          {
            foreignKeyName: "budgets_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "budgets_category_fk";
            columns: ["category_id", "kind"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id", "kind"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_balance: {
        Args: Record<string, never>;
        Returns: number;
      };
      get_period_summary: {
        Args: { p_from: string; p_to: string };
        Returns: { income: number; expense: number }[];
      };
      get_daily_series: {
        Args: { p_from: string; p_to: string };
        Returns: { day: string; income: number; expense: number }[];
      };
      get_monthly_series: {
        Args: { p_year: number };
        Returns: { month: number; income: number; expense: number }[];
      };
      get_category_totals: {
        Args: { p_from: string; p_to: string; p_kind: TransactionKind };
        Returns: { category_id: string; name: string; total: number }[];
      };
      get_available_years: {
        Args: Record<string, never>;
        Returns: { year: number }[];
      };
    };
    Enums: {
      transaction_kind: TransactionKind;
      payment_method: PaymentMethod;
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

/** Hasil Server Action: sukses tanpa data, atau pesan error untuk form. */
export type ActionState =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

/** Transaksi beserta kategori yang di-embed dari PostgREST. */
export type TransactionWithCategory = TransactionRow & {
  category: Pick<CategoryRow, "id" | "name" | "archived"> | null;
};

export type PeriodSummary = {
  income: number;
  expense: number;
};

export type DailyPoint = {
  day: string;
  income: number;
  expense: number;
};

export type MonthlyPoint = {
  month: number;
  income: number;
  expense: number;
};

export type CategoryTotal = {
  categoryId: string;
  name: string;
  total: number;
};

export type Period = {
  year: number;
  month: number;
};

export type ReportTab = "harian" | "bulanan" | "tahunan";

export type TransactionSort = "terbaru" | "terlama" | "nominal";
