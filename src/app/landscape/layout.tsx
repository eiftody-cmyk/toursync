import type { Metadata } from "next";
import "../education/education.css";

export const metadata: Metadata = {
  title: "Osaka's Lost Landscapes",
  description:
    "Historical reconstructions of Osaka Castle's lost landscapes. Stand where history happened.",
};

export default function LandscapeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
