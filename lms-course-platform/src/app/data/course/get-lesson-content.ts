import 'server-only';
import { requireUser } from '../user/require-user';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';

export async function getLessonContent(lessonId: string) {
    const session = await requireUser();

    const lesson = await prisma.lesson.findUnique({
        where: {
            id: lessonId,
        },
        select: {
            id: true,
            title: true,
            position: true,
            description: true,
            thumbnailKey: true,
            videoKey: true,
            lessonProgress: {
                where: {
                    userId: session.id,
                },
                select: {
                    completed: true,
                    lessonId: true,
                }
            },
            chapter: {
                select: {
                    id: true,
                    courseId: true,
                    course: {
                        select: {
                            slug: true,
                        }
                    }
                }
            }
        },
    });

    if (!lesson) {
        return notFound();
    }

    const enrollment = await prisma.enrollment.findUnique({
        where: {
            courseId_userId: {
                userId: session.id,
                courseId: lesson.chapter.courseId,
            },
        },
        select: {
            status: true,
        },
    });

    if (!enrollment || enrollment.status !== 'ACTIVE') {
        return notFound();
    }

    // Prev / next navigation across the whole course (ordered by chapter then lesson)
    const chapters = await prisma.chapter.findMany({
        where: { courseId: lesson.chapter.courseId },
        orderBy: { position: 'asc' },
        select: {
            id: true,
            lessons: {
                orderBy: { position: 'asc' },
                select: { id: true, title: true, position: true },
            },
        },
    });

    const flat: { id: string; title: string }[] = chapters.flatMap((c) => c.lessons);
    const idx = flat.findIndex((l) => l.id === lessonId);

    return {
        ...lesson,
        prevLesson: idx > 0 ? flat[idx - 1] : null,
        nextLesson: idx >= 0 && idx < flat.length - 1 ? flat[idx + 1] : null,
    };
};

export type LessonContentType = Awaited<ReturnType<typeof getLessonContent>>;