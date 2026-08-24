import { auth } from "@/lib/auth";
import arcjet, { detectBot, protectSignup, slidingWindow } from "@/lib/arcjet";
import ip from "@arcjet/ip";
import type { ArcjetDecision, BotOptions, EmailOptions, ProtectSignupOptions, SlidingWindowRateLimitOptions } from "@arcjet/next";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest } from "next/server";

const emailOptions = {
    mode: "LIVE",
    deny: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
} satisfies EmailOptions;

const botOptions = {
    mode: "LIVE",
    allow: [],
} satisfies BotOptions;

const rateLimitOptions = {
    mode: "LIVE",
    interval: "2m",
    max: 5,
} satisfies SlidingWindowRateLimitOptions<[]>;

const signupOptions = {
    email: emailOptions,
    bots: botOptions,
    rateLimit: rateLimitOptions,
} satisfies ProtectSignupOptions<[]>;

async function protect(req: NextRequest): Promise<ArcjetDecision> {
    const session = await auth.api.getSession({
        headers: req.headers,
    });

    const userId = session?.user.id ?? ip(req) ?? "127.0.0.1";

    if (req.nextUrl.pathname.startsWith("/api/auth/sign-up")) {
        const body = await req.clone().json();

        if (typeof body.email === "string") {
            return arcjet
                .withRule(protectSignup(signupOptions))
                .protect(req, {
                    email: body.email,
                    fingerprint: userId,
                });
        }

        return arcjet
            .withRule(detectBot(botOptions))
            .withRule(slidingWindow(rateLimitOptions))
            .protect(req, {
                fingerprint: userId,
            });
    }

    return arcjet
        .withRule(detectBot(botOptions))
        .protect(req, {
            fingerprint: userId,
        });
}

const authHandlers = toNextJsHandler(auth.handler);

export const GET = authHandlers.GET;

export const POST = async (req: NextRequest) => {
    const decision = await protect(req);

    console.log("Arcjet Decision:", decision);

    if (decision.isDenied()) {
        if (decision.reason.isRateLimit()) {
            return new Response(null, {
                status: 429,
                statusText: "Too Many Requests",
            });
        }

        if (decision.reason.isEmail()) {
            let message = "Email address is not allowed.";

            if (decision.reason.emailTypes.includes("INVALID")) {
                message = "Invalid email address.";
            } else if (decision.reason.emailTypes.includes("DISPOSABLE")) {
                message = "Disposable email addresses are not allowed.";
            } else if (decision.reason.emailTypes.includes("NO_MX_RECORDS")) {
                message = "Email address does not have valid MX records.";
            }

            return Response.json({ error: message }, { status: 400 });
        }

        if (decision.reason.isBot()) {
            return new Response(null, {
                status: 403,
                statusText: "Forbidden",
            });
        }

        return new Response(null, {
            status: 403,
            statusText: "Forbidden",
        });
    }

    return authHandlers.POST(req);
};