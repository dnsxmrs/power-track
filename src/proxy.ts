import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

// Routes that require the user to be logged in
const PROTECTED_ROUTES = ['/dashboard', '/devices', '/alerts', '/reports', '/logs', '/branches', '/settings'];

// Routes that should redirect to dashboard if already logged in
const AUTH_ROUTES = ['/sign-in', '/sign-up', '/forgot-password'];

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
    const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

    // Fast pre-check: if there's no session cookie at all, skip the DB call
    const hasSessionCookie = request.cookies.has('better-auth.session_token');

    if (isProtected) {
        if (!hasSessionCookie) {
            const signInUrl = new URL('/sign-in', request.url);
            signInUrl.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(signInUrl);
        }

        // Verify the session is actually valid
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session) {
            const signInUrl = new URL('/sign-in', request.url);
            signInUrl.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(signInUrl);
        }

        return NextResponse.next();
    }

    if (isAuthRoute && hasSessionCookie) {
        // Verify it's a real session before bouncing them away
        const session = await auth.api.getSession({ headers: request.headers });

        if (session) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Run on all routes except:
         * - API routes (/api/*)
         * - Next.js internals (_next/static, _next/image)
         * - Static files (favicon, sitemap, robots)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
    ],
};