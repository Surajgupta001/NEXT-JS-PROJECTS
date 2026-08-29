import { getUploadAuthParams } from "@imagekit/next/server";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { env } from "@/lib/env";
import arcjet, { detectBot, fixedWindow } from "@/lib/arcjet";
import { auth } from "@/lib/auth";

// Route-specific Arcjet rules
const aj = arcjet
    .withRule(
        detectBot({
            mode: "LIVE",
            allow: [],
        })
    )
    .withRule(
        fixedWindow({
            mode: "LIVE",
            window: "1m",
            max: 5,
        })
    );

export async function POST(request: Request) {
    try {

        // Check Authentication
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        // Check if the user is authenticated
        if (!session?.user) {
            return NextResponse.json({
                error: "Unauthorized",
            }, {
                status: 401
            });
        }

        // Protect the route with Arcjet
        const decision = await aj.protect(request, {
            fingerprint: session.user.id,
        });

        // Check if the request is denied by Arcjet
        if (decision.isDenied()) {
            return NextResponse.json({
                error: "Too many requests",
            }, {
                status: 429

            });
        }

        // Generate ImageKit authentication
        const { token, expire, signature } = getUploadAuthParams({
            privateKey: env.IMAGEKIT_PRIVATE_KEY,
            publicKey: env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
        });

        return NextResponse.json({
            token,
            expire,
            signature,
            publicKey: env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
        }, {
            status: 200
        });
    } catch (error) {
        console.error("ImageKit authentication error:", error);

        return NextResponse.json({
            error: "Failed to generate ImageKit authentication",
        }, {
            status: 500
        });
    }
}