import { getAllCourses } from '@/app/data/course/get-all-courses';
import PublicCourseCard, { PublicCourseCardSkeleton } from '../_components/PublicCourseCard';
import { Suspense } from 'react';
import CourseFilters from './_components/CourseFilters';
import CoursePagination from './_components/CoursePagination';
import EmptyState from '@/components/general/EmptyState';

type SearchParams = Promise<{
    q?: string;
    category?: string;
    level?: string;
    sort?: string;
    page?: string;
}>;

export default async function PublicCoursesRoute({ searchParams }: { searchParams: SearchParams }) {
    const params = await searchParams;

    return (
        <div className='mt-5'>
            <div className='flex flex-col mb-6 space-y-2'>
                <h1 className='text-3xl font-bold tracking-tighter md:text-4xl'>Explore Courses</h1>
                <p className='text-muted-foreground'>Discover a wide range of courses to enhance your skills and knowledge.</p>
            </div>
            <Suspense fallback={<div className='mb-6 h-10' />}>
                <CourseFilters />
            </Suspense>
            <Suspense fallback={<LoadingSkeletonLayout />}>
                <RenderCourses
                    query={params.q ?? ''}
                    category={params.category ?? ''}
                    level={params.level ?? ''}
                    sort={(params.sort as 'newest' | 'price-asc' | 'price-desc' | 'title') ?? 'newest'}
                    page={Number(params.page) || 1}
                    rawParams={params}
                />
            </Suspense>
        </div>
    );
}

async function RenderCourses({
    query,
    category,
    level,
    sort,
    page,
    rawParams,
}: {
    query: string;
    category: string;
    level: string;
    sort: 'newest' | 'price-asc' | 'price-desc' | 'title';
    page: number;
    rawParams: Record<string, string | undefined>;
}) {
    const { courses, total, totalPages, page: currentPage } = await getAllCourses({
        query,
        category,
        level,
        sort,
        page,
    });

    if (courses.length === 0) {
        return (
            <EmptyState
                title='No courses found'
                description={total === 0 ? 'Try a different search or filter.' : 'No courses on this page.'}
                buttonText='Clear filters'
                href='/courses'
            />
        );
    }

    function buildHref(nextPage: number) {
        const params = new URLSearchParams();
        if (rawParams.q) params.set('q', rawParams.q);
        if (rawParams.category) params.set('category', rawParams.category);
        if (rawParams.level) params.set('level', rawParams.level);
        if (rawParams.sort) params.set('sort', rawParams.sort);
        if (nextPage > 1) params.set('page', String(nextPage));
        const qs = params.toString();
        return `/courses${qs ? `?${qs}` : ''}`;
    }

    return (
        <>
            <p className='mb-4 text-sm text-muted-foreground' role='status'>
                {total} course{total === 1 ? '' : 's'} found
            </p>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                {courses.map((course) => (
                    <PublicCourseCard key={course.id} data={course} />
                ))}
            </div>
            <CoursePagination page={currentPage} totalPages={totalPages} buildHref={buildHref} />
        </>
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