import type { Metadata } from "next";

import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Daftar",
};

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Daftar</h1>
        <p className="text-muted-foreground text-sm">
          Buat akun untuk mulai mencatat keuangan.
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
