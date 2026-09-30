import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in — ExperienceRelay",
  description:
    "ExperienceRelay syncs availability, bookings and calendars across GetYourGuide, Viator, Travelio, Airbnb Experiences, and your direct booking page.",
  icons: {
    icon: "/experiencerelay.png",
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
