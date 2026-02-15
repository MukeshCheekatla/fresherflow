'use client';

import { AuthProvider } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export function ConditionalAuthProvider({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const isAdminRoute = pathname?.startsWith('/admin');
    const isLandingPage = pathname === '/';

    // Don't wrap admin and pure marketing landing routes with user AuthProvider.
    // This avoids auth bootstrap + /api/auth/me work on the landing page.
    if (isAdminRoute || isLandingPage) {
        return <>{children}</>;
    }

    return <AuthProvider>{children}</AuthProvider>;
}

