import type { Metadata } from "next";
import { LogOut } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { ProfileForm } from "@/components/profile/profile-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { logout } from "@/lib/actions/auth";
import { requireUser } from "@/lib/auth";
import { getProfile } from "@/lib/db/profile";

export const metadata: Metadata = {
  title: "Pengaturan",
};

export default async function PengaturanPage() {
  const user = await requireUser();
  const profile = await getProfile(user.id);

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="Pengaturan"
        description="Profil dan pengelolaan akun."
      />

      <Card>
        <CardHeader>
          <CardTitle>Profil</CardTitle>
          <CardDescription>
            Nama lengkap dipakai untuk sapaan di aplikasi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            fullName={profile?.full_name ?? ""}
            email={user.email}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sesi</CardTitle>
          <CardDescription>
            Keluar dari akun ini pada perangkat yang sedang dipakai.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={logout}>
            <Button type="submit" variant="outline">
              <LogOut className="size-4" aria-hidden />
              Keluar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
