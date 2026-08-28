'use server';

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { courseSchema, CourseSchema } from "@/lib/zodSchema";
import { headers } from "next/headers";

export async function createCourse(values: CourseSchema) {
    try {

        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return {
                success: false,
                status: 'error',
                message: 'User not authenticated',
            };
        }

        const validation = courseSchema.safeParse(values);

        if (!validation.success) {
            return {
                success: false,
                status: 'error',
                message: 'Invalid data Format',
            };
        }

        await prisma.course.create({
            data: {
                ...validation.data,
                userId: session?.user.id,
            },
        });

        return {
            success: true,
            status: 'success',
            message: 'Course created successfully',
        };
    } catch (error) {
        console.error('Error creating course:', error);

        return {
            success: false,
            status: 'error',
            message: 'Failed to create course',
        };
    }
};