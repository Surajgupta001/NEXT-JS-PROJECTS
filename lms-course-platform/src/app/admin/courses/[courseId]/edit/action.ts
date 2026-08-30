'use server';

import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/db";
import { courseSchema, CourseSchema } from "@/lib/zodSchema";


export async function editCourse(data: CourseSchema, courseId: string) {
    const user = await requireAdmin();

    try {
        const result = courseSchema.safeParse(data);

        if (!result.success) {
            return {
                success: false,
                status: "error",
                message: "Invalid data format.",
            };
        }

        await prisma.course.update({
            where: {
                id: courseId,
                userId: user.user.id,
            },
            data: {
                ...result.data,
            },
        });

        return {
            success: true,
            status: "success",
            message: "Course updated successfully.",
        };

    } catch (error) {
        console.error("Error editing course:", error);

        return {
            success: false,
            status: "error",
            message: "Failed to update course. Please try again later.",
        };
    }
};