"use client";

import Link from "next/link";
import { useActionState } from "react";

import { SubmitButton } from "@/components/shared/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/actions/auth";
import type { ActionState } from "@/lib/types";

const initialState: ActionState = { ok: false, error: "" };

export function LoginForm() {
  const [state, formAction] = useActionState(login, initialState);
  const fieldErrors = state.ok ? {} : (state.fieldErrors ?? {});

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="nama@email.com"
          aria-invalid={Boolean(fieldErrors.email)}
          required
        />
        {fieldErrors.email ? (
          <p className="text-destructive text-sm">{fieldErrors.email}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(fieldErrors.password)}
          required
        />
        {fieldErrors.password ? (
          <p className="text-destructive text-sm">{fieldErrors.password}</p>
        ) : null}
      </div>

      {!state.ok && state.error ? (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      ) : null}

      <SubmitButton>Masuk</SubmitButton>

      <p className="text-muted-foreground text-center text-sm">
        Belum punya akun?{" "}
        <Link href="/register" className="text-foreground underline">
          Daftar
        </Link>
      </p>
    </form>
  );
}
