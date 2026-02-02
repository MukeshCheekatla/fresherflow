'use client';

import { usePathname } from 'next/navigation';
import { Navbar, MobileNav } from '@/components/ui/Navigation';

export function NavigationWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthRoute = pathname === '/login' || pathname === '/register';
    const isAdminRoute = pathname?.startsWith('/admin');

    // Completely hide navigation and padding on auth/admin routes
    const hideNav = isAuthRoute || isAdminRoute;
    const isHomePage = pathname === '/';

    return (
        <>
            {!hideNav && <Navbar />}
            {!hideNav ? (
                <main className={`pt-20 ${!isHomePage ? "container-app py-10" : ""} animate-in fade-in duration-700`}>
                    <div className="pb-20 md:pb-0">
                        {children}
                    </div>
                </main>
            ) : (
                <div className="animate-in fade-in duration-700">
                    {children}
                </div>
            )}
            {!hideNav && <MobileNav />}
        </>
    );
}
