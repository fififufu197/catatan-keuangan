import { redirect } from "next/navigation";

import { getUserOrNull } from "@/lib/auth";

export default async function AuthLayout({
  children,
}: LayoutProps<"/">) {
  const user = await getUserOrNull();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="bg-muted/40 flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}
