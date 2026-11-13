"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { FormError } from "@/components/shared/form-error";
import { SubmitButton } from "@/components/shared/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/lib/actions/profile";
import { MAX_FULL_NAME_LENGTH } from "@/lib/constants";
import type { ActionState } from "@/lib/types";

const initialState: ActionState = { ok: false, error: "" };

export function ProfileForm({
  fullName,
  email,
}: {
  fullName: string;
  email: string;
}) {
  const [state, formAction] = useActionState(updateProfile, initialState);
  const fieldErrors = state.ok ? {} : (state.fieldErrors ?? {});

  useEffect(() => {
    if (state.ok) {
      toast.success("Profil disimpan.");
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} readOnly disabled />
        <p className="text-muted-foreground text-xs">
          Email tidak bisa diubah dari aplikasi.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName">Nama lengkap</Label>
        <Input
          id="fullName"
          name="fullName"
          defaultValue={fullName}
          maxLength={MAX_FULL_NAME_LENGTH}
          aria-invalid={Boolean(fieldErrors.fullName)}
          required
        />
        {fieldErrors.fullName ? (
          <p className="text-destructive text-sm">{fieldErrors.fullName}</p>
        ) : null}
      </div>

      {!state.ok ? <FormError message={state.error} /> : null}

      <SubmitButton>Simpan profil</SubmitButton>
    </form>
  );
}
