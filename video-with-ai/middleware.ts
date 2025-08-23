import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server";

export default withAuth(
    function middleware() {
        return NextResponse.next();
    }, {
    callbacks: {
        authorized: ({ req, token }) => {
            const { pathname } = req.nextUrl
            if (
                pathname.startsWith('/api/auth') ||
                pathname === '/login' ||
                pathname === '/register'
            )
                return true

            if (pathname === '/' || pathname.startsWith('/api/videos')) {
                return true;
            }

            return !!token
        },
    },
});

export const config = {
    matcher: [
        /*
        * Match all request path except:
        * - _next/static (static files)
        * - _next/image (image optimization files)
        * - favicon.ico (favicon files)
        * - public folder (static files)
        */
        '/((?!_next/static|_next/image|favicon.ico|public).*)'
    ],
};