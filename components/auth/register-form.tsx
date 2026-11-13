"use client";

import Link from "next/link";
import { useActionState } from "react";

import { SubmitButton } from "@/components/shared/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { register } from "@/lib/actions/auth";
import { MIN_PASSWORD_LENGTH } from "@/lib/constants";
import type { ActionState } from "@/lib/types";

const initialState: ActionState = { ok: false, error: "" };

export function RegisterForm() {
  const [state, formAction] = useActionState(register, initialState);
  const fieldErrors = state.ok ? {} : (state.fieldErrors ?? {});

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="fullName">Nama lengkap</Label>
        <Input
          id="fullName"
          name="fullName"
          autoComplete="name"
          placeholder="Nama kamu"
          aria-invalid={Boolean(fieldErrors.fullName)}
          required
        />
        {fieldErrors.fullName ? (
          <p className="text-destructive text-sm">{fieldErrors.fullName}</p>
        ) : null}
      </div>

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
          autoComplete="new-password"
          aria-invalid={Boolean(fieldErrors.password)}
          required
        />
        <p className="text-muted-foreground text-xs">
          Minimal {MIN_PASSWORD_LENGTH} karakter.
        </p>
        {fieldErrors.password ? (
          <p className="text-destructive text-sm">{fieldErrors.password}</p>
        ) : null}
      </div>

      {!state.ok && state.error ? (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      ) : null}

      <SubmitButton>Daftar</SubmitButton>

      <p className="text-muted-foreground text-center text-sm">
        Sudah punya akun?{" "}
        <Link href="/login" className="text-foreground underline">
          Masuk
        </Link>
      </p>
    </form>
  );
}
