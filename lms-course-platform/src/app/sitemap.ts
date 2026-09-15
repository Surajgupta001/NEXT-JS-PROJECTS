import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const base = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

    const courses = await prisma.course.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, updatedAt: true },
        take: 500,
        orderBy: { updatedAt: "desc" },
    });

    return [
        { url: `${base}/`, changeFrequency: "daily", priority: 1 },
        { url: `${base}/courses`, changeFrequency: "daily", priority: 0.9 },
        ...courses.map((c) => ({
            url: `${base}/courses/${c.slug}`,
            lastModified: c.updatedAt,
            changeFrequency: "weekly" as const,
            priority: 0.7,
        })),
    ];
}
