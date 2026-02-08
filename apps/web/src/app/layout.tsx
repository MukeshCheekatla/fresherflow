import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConditionalAuthProvider } from "@/components/providers/ConditionalAuthProvider";
import { SmartToaster } from "@/components/providers/SmartToaster";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { NavigationWrapper } from "@/components/providers/NavigationWrapper";
import ServiceWorkerRegister from "@/components/providers/ServiceWorkerRegister";
import { ThemeScript } from "@/components/providers/ThemeScript";
import OfflineNotification from "@/components/ui/OfflineNotification";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#f8fafc",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://fresherflow.in"),
  title: {
    default: "FresherFlow",
    template: "%s | FresherFlow",
  },
  description: "A verified feed of jobs, internships, and walk-ins. Engineering the future of entry-level hiring with direct access to official company portals.",
  alternates: {
    canonical: "./",
  },
  icons: {
    icon: "/favicon-32x32.png",
    shortcut: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "FresherFlow",
    statusBarStyle: "default"
  }
};

import { AuthFormDataProvider } from "@/contexts/AuthFormDataContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
        <script src="https://accounts.google.com/gsi/client" async defer></script>
        {/* Dynamic Manifest Loader for Admin PWA */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (window.location.pathname.startsWith('/admin')) {
                var link = document.createElement('link');
                link.rel = 'manifest';
                link.href = '/admin-manifest.json';
                document.head.appendChild(link);
              } else {
                var link = document.createElement('link');
                link.rel = 'manifest';
                link.href = '/manifest.webmanifest';
                document.head.appendChild(link);
              }
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} antialiased bg-background text-foreground selection:bg-primary/20`} suppressHydrationWarning>
        <ThemeProvider>
          <AuthFormDataProvider>
            <ConditionalAuthProvider>
              <NavigationWrapper>
                {children}
              </NavigationWrapper>
            </ConditionalAuthProvider>
          </AuthFormDataProvider>
        </ThemeProvider>
        <ServiceWorkerRegister />
        <SmartToaster />
        <OfflineNotification />
      </body>
    </html>
  );
}

