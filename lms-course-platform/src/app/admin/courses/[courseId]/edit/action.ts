'use server';

import { requireAdmin } from "@/app/data/admin/require-admin";
import arcjet, { detectBot, fixedWindow } from "@/lib/arcjet";
import { prisma } from "@/lib/db";
import { chapterSchema, ChapterSchema, courseSchema, CourseSchema } from "@/lib/zodSchema";
import { request } from "@arcjet/next";
import { revalidatePath } from "next/cache";

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

export async function editCourse(data: CourseSchema, courseId: string) {
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
            } else {
                return {
                    success: false,
                    status: "error",
                    message: "Access denied.",
                };
            }
        }

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
                userId: session.user.id,
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

export async function reorderLessons(courseId: string, lessons: { id: string; position: number }[], chapterId: string) {
    await requireAdmin();

    try {
        if (!lessons || lessons.length === 0) {
            return {
                success: false,
                status: "error",
                message: "No lessons to reorder.",
            };
        }

        const updates = lessons.map((lesson) =>
            prisma.lesson.update({
                where: {
                    id: lesson.id,
                    chapterId: chapterId,
                },
                data: {
                    position: lesson.position
                },
            })
        );

        await prisma.$transaction(updates);

        revalidatePath(`/admin/courses/${courseId}/edit`);

        return {
            success: true,
            status: "success",
            message: "Lessons reordered successfully.",
        };

    } catch (error) {
        console.error("Error reordering lessons:", error);

        return {
            success: false,
            status: "error",
            message: "Failed to reorder lessons. Please try again later.",
        };
    }
};

export async function reorderChapters(courseId: string, chapters: { id: string; position: number }[]) {
    await requireAdmin();

    try {
        if (!chapters || chapters.length === 0) {
            return {
                success: false,
                status: "error",
                message: "No chapters to reorder.",
            };
        }

        const updates = chapters.map((chapter) =>
            prisma.chapter.update({
                where: {
                    id: chapter.id,
                    courseId: courseId,
                },
                data: {
                    position: chapter.position
                },
            })
        );

        await prisma.$transaction(updates);

        revalidatePath(`/admin/courses/${courseId}/edit`);

        return {
            success: true,
            status: "success",
            message: "Chapters reordered successfully.",
        };

    } catch (error) {
        console.error("Error reordering chapters:", error);

        return {
            success: false,
            status: "error",
            message: "Failed to reorder chapters. Please try again later.",
        };
    }
};

export async function createChapter(values: ChapterSchema) {
    await requireAdmin();

    try {
        const result = chapterSchema.safeParse(values);

        if (!result.success) {
            return {
                success: false,
                status: "error",
                message: "Invalid data format.",
            };
        }

        await prisma.$transaction(async (tsx) => {
            const maxPos = await tsx.chapter.findFirst({
                where: {
                    courseId: result.data.courseId,
                },
                select: {
                    position: true
                },
                orderBy: {
                    position: 'desc'
                },
            });

            await tsx.chapter.create({
                data: {
                    title: result.data.name,
                    courseId: result.data.courseId,
                    position: (maxPos?.position ?? 0) + 1,
                }
            });
        });

        revalidatePath(`/admin/courses/${result.data.courseId}/edit`);

        return {
            success: true,
            status: "success",
            message: "Chapter created successfully.",
        };
        
    } catch (error) {
        console.error("Error creating chapter:", error);

        return {
            success: false,
            status: "error",
            message: "Failed to create chapter. Please try again later.",
        };
    }
};