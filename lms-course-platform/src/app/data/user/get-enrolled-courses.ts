import 'server-only';
import { requireUser } from './require-user';
import { prisma } from '@/lib/db';

export async function getEnrolledCourses() {
    const user = await requireUser();

    const data = await prisma.enrollment.findMany({
        where: {
            userId: user.id,
            status: 'ACTIVE',
        },
        select: {
            course: {
                select: {
                    id: true,
                    title: true,
                    smallDescription: true,
                    duration: true,
                    level: true,
                    status: true,
                    price: true,
                    fileKey: true,
                    slug: true,
                    chapters: {
                        select: {
                            id: true,
                            lessons: {
                                select: {
                                    id: true,
                                    lessonProgress: {
                                        where: {
                                            userId: user.id,
                                        },
                                        select: {
                                            id: true,
                                            completed: true,
                                            lessonId: true,
                                        }
                                    }
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    return data;
};

export type EnrolledCourseType = Awaited<ReturnType<typeof getEnrolledCourses>>[0];