'use server';

import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function deleteCourse(courseId: string) {
    await requireAdmin();

    try {
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