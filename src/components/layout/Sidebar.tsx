"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "◧" },
  { href: "/calendar", label: "Calendar", icon: "📅" },
  { href: "/tours", label: "Tours", icon: "🗺️" },
  { href: "/settings", label: "Settings", icon: "⚙" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-card flex flex-col hidden md:flex">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="font-bold text-lg">ExperienceRelay</span>
          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
            MVP
          </span>
        </Link>
        <p className="text-xs text-muted-foreground mt-1">
          Block once. Sync everywhere.
        </p>
      </div>
      <Separator />
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t">
        <p className="text-xs text-muted-foreground px-3 py-2">
          Airbnb syncs immediately via Google Calendar push.
        </p>
        <Button variant="outline" size="sm" asChild className="w-full mt-2">
          <Link href="/">← Back to site</Link>
        </Button>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="flex md:hidden border-b bg-card px-2 py-2 gap-1 overflow-x-auto">
      {navItems.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm whitespace-nowrap",
              active ? "bg-primary text-primary-foreground" : "bg-muted"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
