import { openai } from "@/configs/opneai";
import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

async function main(base64Image, mimeType) {
    const messages = [
        {
            role: "system",
            content: `
                    You are a product listing assistant for an e-commerce store.
                    Your job is to analyze an image of a product and generate structured data.

                    Respond only with raw JSON (no code block, no markdown, no explanation).
                    The JSON must strictly follow this schema:

                    {
                    "name" : string,             // short product name
                    "description" : string,      // marketing-frendly
                    description of the product
                    }
            `,
        },
        {
            role: "user",
            content: [
                {
                    type: "text",
                    text: "Analyze the image and return name + description",
                },
                {
                    type: "image_url",
                    image_url: {
                        url: `data:${mimeType};base64,${base64Image}`,
                    },
                },
            ],
        },
    ];
    const response = await openai.chat.completions.create({
        model: process.env.OPEN_AI_MODEL,
        messages,
    });
    const raw = response.choices[0].message.content;

    // remove ````json or ``` wrapper if exists
    const cleaned = raw.replace(/```json|```/g, "").trim();

    let parsed;
    try {
        parsed = JSON.parse(cleaned);
    } catch (error) {
        throw new Error('AI did not return valid JSON');
    }

    return parsed;
}

export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        const isSeller = await authSeller(userId);

        if (!isSeller) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                {
                    status: 401,
                }
            );
        }
        const { base64Image, mimeType } = await request.json();
        const result = await main(base64Image, mimeType);
        return NextResponse.json({
            success: true,
            ...result
        }, {
            status: 200,
        })
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error.code || error.message
        }, {
            status: 400,
        })
    }
}
