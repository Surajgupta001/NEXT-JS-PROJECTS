'use server';

import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/db";
import { lessonSchema, LessonSchema } from "@/lib/zodSchema";

export async function updateLesson(values: LessonSchema, lessonId: string) {
    await requireAdmin();

    try {
        const result = lessonSchema.safeParse(values);

        if (!result.success) {
            return {
                success: false,
                status: "error",
                message: "Invalid data",
            };
        };

        await prisma.lesson.update({
            where: {
                id: lessonId,
            },
            data: {
                title: result.data.name,
                description: result.data.description,
                videoKey: result.data.videoKey,
                thumbnailKey: result.data.thumbnailKey,
            },
        });

        return {
            success: true,
            status: "success",
            message: "Lesson updated successfully",
        }
    } catch (error) {
        console.error("Error updating lesson:", error);

        return {
            success: false,
            status: "error",
            message: "An error occurred while updating the lesson",
        };
    }
};