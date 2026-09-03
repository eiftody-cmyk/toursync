import { Sidebar, MobileNav } from "@/components/layout/Sidebar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <MobileNav />
        <header className="border-b bg-card/50 px-6 py-3 flex items-center justify-between">
          <p className="text-sm text-muted-foreground truncate">
            {user.email}
          </p>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="text-sm underline text-muted-foreground"
            >
              Sign out
            </button>
          </form>
        </header>
        <main className="flex-1 p-4 md:p-6 bg-muted/20">{children}</main>
      </div>
    </div>
  );
}
