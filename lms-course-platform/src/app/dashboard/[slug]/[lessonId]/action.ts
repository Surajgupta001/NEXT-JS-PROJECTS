'use server';

import { requireUser } from "@/app/data/user/require-user";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function markLessonAsComplete(lessonId: string, slug: string) {
    const session = await requireUser();

    try {
        await prisma.lessonProgress.upsert({
            where: {
                userId_lessonId: {
                    userId: session.id,
                    lessonId: lessonId,
                },
            },
            update: {
                completed: true,
            },
            create: {
                lessonId: lessonId,
                userId: session.id,
                completed: true,
            }
        });

        revalidatePath(`/dashboard/${slug}`);

        return {
            status: 'success',
            message: 'Lesson marked as complete successfully.',
        }

    } catch (error) {
        console.error('Error marking lesson as complete:', error);
        
        return {
            status: 'error',
            message: 'An error occurred while marking the lesson as complete.',
        }
    }
};