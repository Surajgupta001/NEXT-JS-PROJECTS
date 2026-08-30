import { env } from "@/lib/env";
import { NextResponse } from "next/server";
import arcjet, { detectBot, fixedWindow } from "@/lib/arcjet";
import { getAdminSession } from "@/app/data/admin/require-admin";

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

export async function DELETE(request: Request) {
    const session = await getAdminSession();

    if (!session) {
        return NextResponse.json({
            error: "Forbidden: Admin access required",
        }, {
            status: 403,
        });
    }
    
    try {

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

        const body = await request.json();

        const { fileId } = body;

        if (!fileId || typeof fileId !== "string") {
            return NextResponse.json({
                error: "Missing 'fileId' in request body",
            }, {
                status: 400,
            });
        }

        const credentials = Buffer.from(`${env.IMAGEKIT_PRIVATE_KEY}:`).toString("base64");

        const response = await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Basic ${credentials}`,
            },
        });

        if (!response.ok) {
            const error = await response.text();
            console.error("ImageKit delete response:", error);

            return NextResponse.json({
                error: "Failed to delete file from ImageKit",
            }, {
                status: response.status,
            });
        }

        return NextResponse.json({
            message: "File deleted successfully",
        }, {
            status: 200,
        });

    } catch (error) {
        console.error("ImageKit delete error:", error);

        return NextResponse.json({
            error: "Failed to delete file",
        }, {
            status: 500,
        });
    }
}