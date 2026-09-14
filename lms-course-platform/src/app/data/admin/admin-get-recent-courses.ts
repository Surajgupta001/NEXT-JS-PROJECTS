import 'server-only';

import { prisma } from "@/lib/db";
import { requireAdmin } from "./require-admin";

export async function adminGetRecentCourses() {
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate a delay for demonstration purposes
    await requireAdmin();

    const data = await prisma.course.findMany({
        orderBy: {
            createdAt: "desc",
        },
        take: 2, // Limit to the 2 most recent courses
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