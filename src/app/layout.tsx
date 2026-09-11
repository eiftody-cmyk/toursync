import type { Metadata } from "next";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
