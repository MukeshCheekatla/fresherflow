import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname, hostname } = request.nextUrl;

    // Check for session marker
    const isAuthenticated = request.cookies.has('ff_logged_in'); // or 'accessToken' if httpOnly isn't an issue for this check

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
