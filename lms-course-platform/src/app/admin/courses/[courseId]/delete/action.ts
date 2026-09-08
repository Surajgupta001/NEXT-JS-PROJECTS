'use server';

import { requireAdmin } from "@/app/data/admin/require-admin";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import { prisma } from "@/lib/db";
import { request } from "@arcjet/next";
import { revalidatePath } from "next/cache";

const aj = arcjet.withRule(
    fixedWindow({
        mode: 'LIVE',
        window: '1m',
        max: 5,
    })
)

export async function deleteCourse(courseId: string) {
    const session = await requireAdmin();

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
                    message: "Rate limit exceeded. Please try again later.",
                };
            }
            return {
                success: false,
                status: "error",
                message: "You are not authorized to perform this action.",
            };
        }

        await prisma.course.delete({
            where: {
                id: courseId,
            },
        });

        revalidatePath("/admin/courses");

        return {
            success: true,
            status: "success",
            message: "Course deleted successfully",
        }

    } catch (error) {
        console.error("Error deleting course:", error);

        return {
            success: false,
            status: "error",
            message: "An error occurred while deleting the course",
        };
    }
};