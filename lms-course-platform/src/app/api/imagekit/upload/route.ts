import { getUploadAuthParams } from "@imagekit/next/server";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function GET() {
    try {
        const { token, expire, signature } =
            getUploadAuthParams({
                privateKey: env.IMAGEKIT_PRIVATE_KEY,
                publicKey: env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
            });

        return NextResponse.json({
            token,
            expire,
            signature,
            publicKey: env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
        });
    } catch (error) {
        console.error(
            "ImageKit authentication error:",
            error
        );

        return NextResponse.json(
            {
                error: "Failed to generate ImageKit authentication",
            },
            {
                status: 500,
            }
        );
    }
}