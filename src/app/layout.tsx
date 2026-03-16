import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TripRescue — Claim Viewer',
  description: 'View shared travel insurance claim details',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, fontFamily: "'DM Sans', system-ui, sans-serif", background: '#f0f4f8', color: '#1a2332', WebkitFontSmoothing: 'antialiased' }}>
        {children}
      </body>
    </html>
  );
}
