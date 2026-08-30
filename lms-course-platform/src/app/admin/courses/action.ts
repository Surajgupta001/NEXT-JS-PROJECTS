"use server";

import { requireAdmin } from "@/app/data/admin/require-admin";
import arcjet, { detectBot, fixedWindow } from "@/lib/arcjet";
import { prisma } from "@/lib/db";
import { courseSchema, CourseSchema } from "@/lib/zodSchema";
import { request } from "@arcjet/next";

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

export async function createCourse(values: CourseSchema) {
    const session = await requireAdmin();

    try {
        // Get current request for Arcjet
        const req = await request();

        // Protect Server Action with Arcjet
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
                message: "Request denied. Please try again later.",
            };
        }

        // Validate course data
        const validation = courseSchema.safeParse(values);

        if (!validation.success) {
            return {
                success: false,
                status: "error",
                message: "Invalid data format.",
            };
        }

        // Create course
        await prisma.course.create({
            data: {
                ...validation.data,
                userId: session.user.id,
            },
        });

        return {
            success: true,
            status: "success",
            message: "Course created successfully.",
        };
        
    } catch (error) {
        console.error(
            "Error creating course:",
            error
        );

        return {
            success: false,
            status: "error",
            message: "Failed to create course.",
        };
    }
}