import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConditionalAuthProvider } from "@/components/providers/ConditionalAuthProvider";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FresherFlow - Every Fresh Opportunity, One Stream",
  description: "The live stream of verified jobs, internships, and walk-ins for freshers. Engineering your success.",
};

import { ThemeProvider } from "@/contexts/ThemeContext";
import { NavigationWrapper } from "@/components/providers/NavigationWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.variable} suppressHydrationWarning>
        <ThemeProvider>
          <ConditionalAuthProvider>
            <NavigationWrapper>
              {children}
            </NavigationWrapper>
          </ConditionalAuthProvider>
        </ThemeProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 5000,
            style: {
              background: '#1f2937',
              color: '#fff',
              fontSize: '14px',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
              duration: 7000,
            },
          }}
        />
      </body>
    </html>
  );
}
