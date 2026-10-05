import { NextRequest, NextResponse } from "next/server";
import { clerkMiddleware } from "@clerk/nextjs/server";

interface MeResponse {
    success: boolean;
    data?: {
        role: 'client' | 'freelancer';
        accountExists: boolean;
        isOnboarded: boolean;
    }
};

const redirectToLandingPage = (reuqest: NextRequest) => NextResponse.redirect(
    new URL(process.env.NEXT_PUBLIC_LANDING_PAGE ?? 'http://localhost:3000', reuqest.url)
);

export default clerkMiddleware(async (auth, request) => {
    if (request.nextUrl.pathname === '/api/me') {
        return NextResponse.next();
    }

    const { userId } = await auth();

    if (!userId) {
        return redirectToLandingPage(request);
    }

    try {
        const headers = new Headers();
        const cokkie = request.headers.get('cookie');
        const authorization = request.headers.get('authorization');

        if (cokkie) headers.set('cookie', cokkie);

        if (authorization) headers.set('authorization', authorization);

        const meResponse = await fetch(new URL('/api/me', request.url), {
            headers,
            cache: 'no-store',
        });

        if (!meResponse.ok) {
            return redirectToLandingPage(request);
        }

        const account = (await meResponse.json()) as MeResponse;

        if (!account.success || !account.data?.accountExists || account.data.role !== 'client') {
            return redirectToLandingPage(request);
        }

        const isEditingProfile = request.nextUrl.pathname.startsWith('/profile/edit');

        if (!account.data.isOnboarded) {
            if (!isEditingProfile) {
                return NextResponse.redirect(new URL('/profile/edit', request.url));
            }

            return NextResponse.next();
        }

        return NextResponse.next();

    } catch (error) {
        console.error('Error in proxy middleware:', error);
        return redirectToLandingPage(request);
    }
});

export const config = {
    matcher: [
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
    ],
};