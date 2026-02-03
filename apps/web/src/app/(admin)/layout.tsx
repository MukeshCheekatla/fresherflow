'use client';

import AdminBottomNav from "@/shared/components/navigation/AdminBottomNav";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { AdminProvider } from "@/contexts/AdminContext";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Skip auth check for login page
    const isLoginPage = pathname === '/admin/login';

    useEffect(() => {
        // Check for admin token in localStorage
        const adminToken = localStorage.getItem('adminToken');
        setIsAuthenticated(!!adminToken);
        setIsLoading(false);

        if (!isLoginPage && !adminToken) {
            router.push('/admin/login');
        }
    }, [pathname, router, isLoginPage]);

    if (isLoginPage) {
        return <AdminProvider>{children}</AdminProvider>;
    }

    if (isLoading) return <LoadingScreen message="Loading..." />;
    if (!isAuthenticated) return null;

    return (
        <AdminProvider>
            <div className="min-h-screen">
                {children}
                <AdminBottomNav />
            </div>
        </AdminProvider>
    );
}

