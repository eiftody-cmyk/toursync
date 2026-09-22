import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "ExperienceRelay - Block dates once. Sync everywhere.",
  description:
    "For small tour operators who sell on multiple platforms. Block a date and it sync to Airbnb automatically. Track capacity and never oversell.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("edu-locale")?.value === "ja" ? "ja" : "en";
  return (
    <html lang={locale} className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
