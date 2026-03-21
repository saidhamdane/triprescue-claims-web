import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TripRescue AI',
  description: 'AI-powered travel claims platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'Arial, sans-serif', background: '#f9fafb' }}>
        {children}
      </body>
    </html>
  );
}
