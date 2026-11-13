import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Masuk",
};

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Masuk</h1>
        <p className="text-muted-foreground text-sm">
          Catatan Keuangan Pribadi
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
