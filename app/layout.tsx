import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Uttal",
  description: "Uttal - Comfort has never built a legacy.",
  authors: [{ name: "AHNayef", url: "https://github.com/ahnayef" }],
  keywords: [
    "goals",
    "task management",
    "productivity",
    "organization",
    "tracking",
    "planning",
  ],
  metadataBase: new URL("https://uttal.vercel.app"),
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Uttal",
    startupImage: [
      {
        url: "meta.png",
        media:
          "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)",
      },
    ],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    url: "https://uttal.vercel.app",
    siteName: "Uttal",
    images: [
      {
        url: "meta.png",
        width: 177,
        height: 112,
        alt: "Meta Image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

import { ThemeProvider } from '@/components/ThemeProvider';
import SessionSync from '@/components/SessionSync';

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable} style={{ height: '100%' }} suppressHydrationWarning>
      <body style={{ minHeight: '100%' }}>
        <ThemeProvider>
          <SessionSync />
          <div className="ambient-background">
            <div className="ambient-orb ambient-orb-1" />
            <div className="ambient-orb ambient-orb-2" />
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
