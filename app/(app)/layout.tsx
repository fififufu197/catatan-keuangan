import { MobileNav } from "@/components/layout/mobile-nav";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { SidebarNav } from "@/components/layout/sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { requireUser } from "@/lib/auth";
import { APP_NAME } from "@/lib/constants";
import { getProfile } from "@/lib/db/profile";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await requireUser();
  const profile = await getProfile(user.id);
  const displayName = profile?.full_name || user.email;

  return (
    <div className="relative md:grid md:min-h-svh md:grid-cols-[16.5rem_1fr]">
      <div className="liquid-canvas" aria-hidden>
        <div className="liquid-blob liquid-blob-brand -top-40 right-[-10%] size-[28rem]" />
        <div className="liquid-blob liquid-blob-indigo top-1/3 left-[-14%] size-[26rem] [animation-delay:-8s]" />
        <div className="liquid-blob liquid-blob-sand bottom-[-18%] right-[18%] size-[24rem] [animation-delay:-15s]" />
      </div>

      <aside className="bg-sidebar/70 border-sidebar-border/70 hidden border-r backdrop-blur-xl md:block">
        <div className="sticky top-0 h-svh overflow-y-auto">
          <SidebarNav />
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="bg-background/70 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border/60 px-4 backdrop-blur-xl md:justify-end md:px-8">
          <MobileSidebar />
          <span className="font-semibold tracking-tight md:hidden">
            {APP_NAME}
          </span>
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <UserMenu name={displayName} email={user.email} />
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-7 pb-28 md:px-8 md:py-10 md:pb-12">
          {children}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
