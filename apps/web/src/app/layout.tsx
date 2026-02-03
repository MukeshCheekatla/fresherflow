import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConditionalAuthProvider } from "@/components/providers/ConditionalAuthProvider";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { NavigationWrapper } from "@/components/providers/NavigationWrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#6366F1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "FresherFlow | Premium Career Feed for Freshers",
  description: "A verified feed of jobs, internships, and walk-ins. Engineering the future of entry-level hiring with direct access to official company portals.",
  // manifest: "/manifest.webmanifest", // Missing assets in /public
  // icons: {
  //   apple: "/icons/apple-touch-icon.png",
  // },
};

import { AuthFormDataProvider } from "@/contexts/AuthFormDataContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
        <Toaster
          position="top-center"
          toastOptions={{
            className: 'premium-card !p-4 !shadow-2xl border border-border/50 text-sm font-bold antialiased',
            duration: 4000,
            style: {
              background: 'var(--card)',
              color: 'var(--foreground)',
              borderRadius: '16px',
            }
          }}
        />
      </body>
    </html>
  );
}

