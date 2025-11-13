import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navigation from '@/components/layout/Navigation';

export const metadata: Metadata = {
  title: 'Ueta Travel Access - Premium Duty-Free Shopping',
  description:
    'Your premium travel companion for seamless duty-free shopping. Click & Reserve your favorite products.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Ueta Travel',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#E60023',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <Navigation />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
