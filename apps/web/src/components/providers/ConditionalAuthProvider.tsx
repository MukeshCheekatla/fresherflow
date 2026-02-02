'use client';

import { AuthProvider } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export function ConditionalAuthProvider({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const isAdminRoute = pathname?.startsWith('/admin');

    // Don't wrap admin routes with user AuthProvider
    if (isAdminRoute) {
        return <>{children}</>;
    }

    return <AuthProvider>{children}</AuthProvider>;
}
