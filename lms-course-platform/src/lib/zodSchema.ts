import * as z from "zod";

export const courseLevels = [
    "BEGINNER",
    "INTERMEDIATE",
    "ADVANCED",
] as const;

export const courseStatus = [
    "DRAFT",
    "PUBLISHED",
    "ARCHIVED",
] as const;

export const courseCategories = [
    "Development",
    "Business",
    "Finance",
    "IT & Software",
    "Office Productivity",
    "Personal Development",
    "Design",
    "Marketing",
    "Health & Fitness",
    "Music",
    "Teaching & Academics",
] as const;

export const courseSchema = z.object({
    title: z
        .string()
        .min(3, "Title must be at least 3 characters")
        .max(100, "Title must be less than 100 characters"),

    description: z
        .string()
        .min(3, "Description must be at least 3 characters"),

    fileKey: z
        .string()
        .min(1, "File key is required"),

    price: z
        .number()
        .min(0, "Price cannot be negative"),

    duration: z
        .number()
        .min(1, "Duration must be at least 1 minute")
        .max(500, "Duration cannot exceed 500 minutes"),

    level: z.enum(courseLevels, {
        error: "Please select a valid course level",
    }),

    category: z.enum(courseCategories, {
        error: "Please select a valid course category",
    }),

    smallDescription: z
        .string()
        .min(3, "Short description must be at least 3 characters")
        .max(200, "Short description cannot exceed 200 characters"),

    slug: z
        .string()
        .min(3, "Slug must be at least 3 characters"),

    status: z.enum(courseStatus, {
        error: "Please select a valid course status",
    }),
});

export const chapterSchema = z.object({
    name: z
        .string()
        .min(3, "Chapter title must be at least 3 characters")
        .max(100, "Chapter title cannot exceed 100 characters"),

    courseId: z
        .string()
        .uuid("Invalid course ID"),
});

export type CourseFormValues = z.input<typeof courseSchema>;

export type CourseSchema = z.output<typeof courseSchema>;

export type CourseCategory = (typeof courseCategories)[number];

export type ChapterSchema = z.output<typeof chapterSchema>;