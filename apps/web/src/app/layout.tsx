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
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://fresherflow.in"),
  title: "FresherFlow | Premium Career Feed for Freshers",
  description: "A verified feed of jobs, internships, and walk-ins. Engineering the future of entry-level hiring with direct access to official company portals.",
  alternates: {
    canonical: "./",
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/main.png",
    shortcut: "/main.png",
    apple: "/main.png",
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

