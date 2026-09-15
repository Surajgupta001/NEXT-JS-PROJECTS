'use client';

import { useMemo } from "react";

interface CourseProgressProps {
    courseData: {
        chapters: {
            lessons: {
                id: string;
                lessonProgress: {
                    lessonId: string;
                    completed: boolean;
                }[];
            }[];
        }[];
    };
};

interface CourseProgressResultProps {
    totalLessons: number;
    completedLessons: number;
    progressPercentage: number;
}

export function useCourseProgress({ courseData }: CourseProgressProps) : CourseProgressResultProps {
    return useMemo(() => {
        let totalLessons = 0;
        let completedLessons = 0;

        courseData.chapters.forEach((chapter) => {
            chapter.lessons.forEach((lesson) => {
                totalLessons ++;

                // Check if the lesson is completed based on the lessonProgress data
                const isCompleted = lesson.lessonProgress.some(
                    (progress) => progress.lessonId === lesson.id && progress.completed
                );

                if (isCompleted) {
                    completedLessons ++;
                }
            });
        });

        const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

        return {
            totalLessons,
            completedLessons,
            progressPercentage,
        }
    }, [courseData]);
};