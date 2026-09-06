import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl">
            ExperienceRelay
          </Link>
          <nav className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/login">Get Started Free</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>ExperienceRelay MVP — Built for small tour operators in Osaka & beyond.</p>
        <p className="mt-1">
          <Link href="/login" className="underline">
            Dashboard
          </Link>{" "}
          ·{" "}
          <a
            href="https://osakacastletours.com"
            className="underline"
            target="_blank"
            rel="noopener"
          >
            Osaka Castle Walks
          </a>
        </p>
      </footer>
    </div>
  );
}
