'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar, MobileNav } from '@/components/ui/Navigation';
import { Footer } from '@/components/ui/Footer';
import { cn } from '@/lib/utils';

export function NavigationWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const normalizedPathname = pathname?.toLowerCase() || '';
    const isAuthRoute = normalizedPathname === '/login' || normalizedPathname === '/register';
    const isAdminRoute = normalizedPathname.startsWith('/admin');

    // Navigation is now constant/fixed and does not hide on scroll per user request
    const hideNav = isAdminRoute;
    const isHomePage = pathname === '/';

    return (
        <>
            {!hideNav && (
                <Suspense fallback={null}>
                    <Navbar />
                </Suspense>
            )}
            <main className={cn(
                "animate-in fade-in duration-300 relative",
                !isAuthRoute && !isAdminRoute && "pt-20 md:pt-24",
                !isAuthRoute && !isAdminRoute && !isHomePage && "pb-4 md:pb-10",
                (isAuthRoute || isAdminRoute) && "min-h-screen flex flex-col"
            )}>
                <div className={cn(
                    "flex-1 flex flex-col",
                    (!isAuthRoute && !isAdminRoute) && "min-h-[calc(100vh-theme(spacing.24)-theme(spacing.20))]" // rough calculation to ensure footer pushes to bottom if content is short
                )}>
                    {children}
                </div>
                {!isAdminRoute && !isAuthRoute && <Footer />}
            </main>
            {!hideNav && (
                <Suspense fallback={null}>
                    <MobileNav />
                </Suspense>
            )}
        </>
    );
}
