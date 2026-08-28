import { env } from "@/lib/env";
import { NextResponse } from "next/server";

export async function DELETE(
    request: Request
) {
    try {
        const body = await request.json();

        const { fileId } = body;

        if (
            !fileId ||
            typeof fileId !== "string"
        ) {
            return NextResponse.json(
                {
                    error:
                        "Missing 'fileId' in request body",
                },
                {
                    status: 400,
                }
            );
        }

        const credentials = Buffer.from(
            `${env.IMAGEKIT_PRIVATE_KEY}:`
        ).toString("base64");

        const response = await fetch(
            `https://api.imagekit.io/v1/files/${fileId}`,
            {
                method: "DELETE",

                headers: {
                    Authorization:
                        `Basic ${credentials}`,
                },
            }
        );

        if (!response.ok) {
            const error =
                await response.text();

            console.error(
                "ImageKit delete response:",
                error
            );

            return NextResponse.json(
                {
                    error:
                        "Failed to delete file from ImageKit",
                },
                {
                    status: response.status,
                }
            );
        }

        return NextResponse.json(
            {
                message:
                    "File deleted successfully",
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error(
            "ImageKit delete error:",
            error
        );

        return NextResponse.json(
            {
                error:
                    "Failed to delete file",
            },
            {
                status: 500,
            }
        );
    }
}