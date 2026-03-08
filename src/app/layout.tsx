
import type {Metadata, Viewport} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from "@/firebase";
import { UserProvider } from "@/context/UserContext";

export const metadata: Metadata = {
  title: 'Lere Tele App',
  description: 'Connect with people globally through HD video and voice calls.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Lere Tele App',
  },
  applicationName: 'Lere Tele App',
  formatDetection: {
    telephone: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#1560bd',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon.png" />
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        <FirebaseClientProvider>
          <UserProvider>
            {children}
            <Toaster />
          </UserProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
