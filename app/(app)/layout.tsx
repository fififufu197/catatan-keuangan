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
    <div className="md:grid md:min-h-svh md:grid-cols-[16rem_1fr]">
      <aside className="bg-sidebar hidden border-r md:block">
        <div className="sticky top-0 h-svh">
          <SidebarNav />
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-30 flex h-14 items-center gap-2 border-b px-4 backdrop-blur md:justify-end">
          <MobileSidebar />
          <span className="font-semibold md:hidden">{APP_NAME}</span>
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <UserMenu name={displayName} email={user.email} />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 pb-24 md:px-8 md:pb-10">
          {children}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
