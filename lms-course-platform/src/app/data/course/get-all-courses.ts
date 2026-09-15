import 'server-only';

import { prisma } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";

export interface CourseFilters {
    query?: string;
    category?: string;
    level?: string;
    sort?: "newest" | "price-asc" | "price-desc" | "title";
    page?: number;
    pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 9;

export async function getAllCourses(filters: CourseFilters = {}) {
    const {
        query = "",
        category = "",
        level = "",
        sort = "newest",
        page = 1,
        pageSize = DEFAULT_PAGE_SIZE,
    } = filters;

    const safePage = Math.max(1, Math.floor(page) || 1);
    const safePageSize = Math.min(24, Math.max(1, Math.floor(pageSize) || DEFAULT_PAGE_SIZE));

    const where: Prisma.CourseWhereInput = {
        status: "PUBLISHED",
        ...(query
            ? {
                OR: [
                    { title: { contains: query, mode: "insensitive" } },
                    { smallDescription: { contains: query, mode: "insensitive" } },
                    { category: { contains: query, mode: "insensitive" } },
                ],
            }
            : {}),
        ...(category ? { category } : {}),
        ...(level ? { level: level as Prisma.EnumCourseLevelFilter } : {}),
    };

    const orderBy: Prisma.CourseOrderByWithRelationInput = (() => {
        switch (sort) {
            case "price-asc":
                return { price: "asc" };
            case "price-desc":
                return { price: "desc" };
            case "title":
                return { title: "asc" };
            case "newest":
            default:
                return { createdAt: "desc" };
        }
    })();

    const [total, courses] = await Promise.all([
        prisma.course.count({ where }),
        prisma.course.findMany({
            where,
            orderBy,
            skip: (safePage - 1) * safePageSize,
            take: safePageSize,
            select: {
                title: true,
                price: true,
                smallDescription: true,
                slug: true,
                fileKey: true,
                id: true,
                level: true,
                duration: true,
                category: true,
            },
        }),
    ]);

    return {
        courses,
        total,
        page: safePage,
        pageSize: safePageSize,
        totalPages: Math.max(1, Math.ceil(total / safePageSize)),
    };
};

export type PublicCourseType = Awaited<ReturnType<typeof getAllCourses>>["courses"][0];