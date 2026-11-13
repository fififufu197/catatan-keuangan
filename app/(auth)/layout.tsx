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
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden p-6">
      <div className="liquid-canvas" aria-hidden>
        <div className="liquid-blob liquid-blob-brand -top-32 right-[8%] size-[24rem]" />
        <div className="liquid-blob liquid-blob-indigo bottom-[-20%] left-[-8%] size-[26rem] [animation-delay:-10s]" />
        <div className="liquid-blob liquid-blob-sand top-1/3 left-[45%] size-[18rem] [animation-delay:-5s]" />
      </div>

      <div className="border-border/70 bg-card/80 relative w-full max-w-sm rounded-[28px] border p-6 shadow-[0_50px_100px_-70px_rgba(11,11,13,0.65)] backdrop-blur-xl">
        {children}
      </div>
    </main>
  );
}
