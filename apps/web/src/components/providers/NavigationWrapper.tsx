'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar, MobileNav } from '@/components/ui/Navigation';
import { cn } from '@/lib/utils';

export function NavigationWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthRoute = pathname === '/login' || pathname === '/register';
    const isAdminRoute = pathname?.startsWith('/admin');

    // Completely hide navigation and padding on auth/admin routes
    const hideNav = isAuthRoute || isAdminRoute;
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
                !isAuthRoute && !isAdminRoute && !isHomePage && "container-app pb-4 md:pb-10",
                (isAuthRoute || isAdminRoute) && "min-h-screen flex flex-col"
            )}>
                <div className={cn(
                    "flex-1 flex flex-col",
                    !isHomePage && !isAuthRoute && "pb-16 md:pb-0"
                )}>
                    {children}
                </div>
            </main>
            {!hideNav && (
                <Suspense fallback={null}>
                    <MobileNav />
                </Suspense>
            )}
        </>
    );
}

