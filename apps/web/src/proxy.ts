import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

export async function proxy(request: NextRequest) {
    const { pathname, hostname } = request.nextUrl;
    const cookieHeader = request.headers.get('cookie') || '';

    // Check for session marker
    const isAuthenticated = request.cookies.has('ff_logged_in') || request.cookies.has('accessToken');
    const isAdminAuthenticated = request.cookies.has('adminAccessToken');
    const isAdminRoute = pathname.startsWith('/admin');
    const isAdminLogin = pathname === '/admin/login';

    const userProtectedPaths = [
        '/dashboard',
        '/opportunities',
        '/jobs',
        '/internships',
        '/walk-ins',
        '/profile/complete',
        '/profile/edit',
        '/account',
        '/account/saved',
    ];

    // 1. Subdomain Handling (app.fresherflow.in)
    // If user hits 'app.domain.com' root, they always want the app.
    if (hostname.startsWith('app.')) {
        if (pathname === '/') {
            // If logged in -> Dashboard
            if (isAuthenticated) {
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }
            // If NOT logged in -> Login
            else {
                return NextResponse.redirect(new URL('/login', request.url));
            }
        }
    }

    // 2. Admin Route Protection
    if (isAdminRoute && !isAdminLogin) {
        if (!isAdminAuthenticated) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
        if (API_URL) {
            const adminCheck = await fetch(`${API_URL}/api/admin/auth/me`, {
                headers: { cookie: cookieHeader },
                cache: 'no-store'
            });
            if (!adminCheck.ok) {
                return NextResponse.redirect(new URL('/admin/login', request.url));
            }
        }
    }

    // 3. User Route Protection (exact matches only)
    if (userProtectedPaths.includes(pathname) && !isAuthenticated) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }
    if (userProtectedPaths.includes(pathname) && isAuthenticated && API_URL) {
        const userCheck = await fetch(`${API_URL}/api/auth/me`, {
            headers: { cookie: cookieHeader },
            cache: 'no-store'
        });
        if (!userCheck.ok) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // 2. Main Domain Root Handling
    // If user is already logged in and visits the landing page,
    // we can optionally redirect them to dashboard for "App-like" feel.
    if (pathname === '/' && isAuthenticated) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|gif|png|svg|ico|webp|js|css|woff|woff2|ttf|eot)).*)',
    ],
};
