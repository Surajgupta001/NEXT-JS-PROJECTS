import { getAllCourses } from '@/app/data/course/get-all-courses';
import PublicCourseCard, { PublicCourseCardSkeleton } from '../_components/PublicCourseCard';
import { Suspense } from 'react';

export default function PublicCoursesRoute() {
    return (
        <div className='mt-5'>
            <div className='flex flex-col mb-10 space-y-2'>
                <h1 className='text-3xl font-bold tracking-tighter md:text-4xl'>Explore Courses</h1>
                <p className='text-muted-foreground'>Discover a wide range of courses to enhance your skills and knowledge.</p>
            </div>
            <Suspense fallback={<LoadingSkeletonLayout />}>
                <RenderCourses />
            </Suspense>
        </div>
    );
}

async function RenderCourses() {
    const courses = await getAllCourses();

    return (
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {courses.map((course) => (
                <PublicCourseCard key={course.id} data={course} />
            ))}
        </div>
    );
};

function LoadingSkeletonLayout() {
    return (
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {Array.from({ length: 9 }).map((_, index) => (
                <PublicCourseCardSkeleton key={index} />
            ))}
        </div>
    )
};