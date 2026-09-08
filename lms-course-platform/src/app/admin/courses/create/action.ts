"use server";

import { requireAdmin } from "@/app/data/admin/require-admin";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { courseSchema, CourseSchema } from "@/lib/zodSchema";
import { request } from "@arcjet/next";

import { revalidatePath } from "next/cache";

const aj = arcjet.withRule(
    fixedWindow({
        mode: "LIVE",
        window: "1m",
        max: 5,
    })
);

export async function createCourse(values: CourseSchema) {
    const session = await requireAdmin();

    // 1. Validate course data first
    const validation = courseSchema.safeParse(values);

    if (!validation.success) {
        const firstIssue = validation.error.issues[0]?.message;
        return {
            success: false,
            status: "error",
            message: firstIssue || "Invalid data format.",
        };
    }

    // 2. Check if a course with this slug already exists
    const existingCourse = await prisma.course.findUnique({
        where: { slug: validation.data.slug },
    });

    if (existingCourse) {
        return {
            success: false,
            status: "error",
            message: `A course with the slug "${validation.data.slug}" already exists. Please choose a different title or slug.`,
        };
    }

    // 3. Protect Server Action with Arcjet
    try {
        const req = await request();
        const decision = await aj.protect(req, {
            fingerprint: session.user.id,
        });

        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                return {
                    success: false,
                    status: "error",
                    message: "Too many requests. Please try again later.",
                };
            }

            return {
                success: false,
                status: "error",
                message: "Request denied by security rule. Please try again later.",
            };
        }
    } catch (ajError) {
        console.warn("Arcjet protection check encountered an error:", ajError);
    }

    let stripeProductId: string | null = null;

    try {
        // 4. Create Stripe product with plain-text description
        const stripeDesc = validation.data.smallDescription || validation.data.title;
        const stripeProduct = await stripe.products.create({
            name: validation.data.title,
            description: stripeDesc,
            default_price_data: {
                currency: "usd",
                unit_amount: Math.round(validation.data.price * 100), // Convert to cents
            },
        });

        stripeProductId = stripeProduct.id;

        const stripePriceId =
            typeof stripeProduct.default_price === "string"
                ? stripeProduct.default_price
                : stripeProduct.default_price?.id;

        if (!stripePriceId) {
            throw new Error("Stripe did not return a default price ID.");
        }

        // 5. Create course in Prisma database
        await prisma.course.create({
            data: {
                ...validation.data,
                price: Math.round(validation.data.price),
                duration: Math.round(validation.data.duration),
                userId: session.user.id,
                stripePriceId: stripePriceId,
            },
        });

        // 6. Revalidate cache
        revalidatePath("/admin/courses");
        revalidatePath("/");

        return {
            success: true,
            status: "success",
            message: "Course created successfully.",
        };

    } catch (error: unknown) {
        console.error("Error creating course:", error);

        const caughtError = error as { code?: unknown; message?: unknown };

        // If Stripe product was created but Prisma failed, archive Stripe product to prevent orphans
        if (stripeProductId) {
            try {
                await stripe.products.update(stripeProductId, { active: false });
            } catch (cleanupError) {
                console.error("Failed to clean up Stripe product:", cleanupError);
            }
        }

        if (caughtError.code === "P2002") {
            return {
                success: false,
                status: "error",
                message: "A course with this slug already exists.",
            };
        }

        return {
            success: false,
            status: "error",
            message:
                typeof caughtError.message === "string"
                    ? caughtError.message
                    : "Failed to create course.",
        };
    }
}