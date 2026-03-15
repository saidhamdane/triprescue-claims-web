import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TripRescue Claims",
  description: "View your shared travel claim",
  openGraph: {
    title: "TripRescue Claims",
    description: "View your shared travel claim",
    type: "website",
    siteName: "TripRescue Claims",
  },
  twitter: {
    card: "summary_large_image",
    title: "TripRescue Claims",
    description: "View your shared travel claim",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
