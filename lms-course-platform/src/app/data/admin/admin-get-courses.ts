import { prisma } from "@/lib/db";
import { requireAdmin } from "./require-admin";

export async function adminGetCourses() {
    await new Promise((resolve) => setTimeout(resolve, 2000)); // simulate a delay of 2 seconds
    
    await requireAdmin();

    const data = await prisma.course.findMany({
        orderBy: {
            createdAt: "desc", // that means the latest course will be on top
        },
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
        },
    });

    return data;
};

export type AdminCourseType = Awaited<ReturnType<typeof adminGetCourses>>[0];