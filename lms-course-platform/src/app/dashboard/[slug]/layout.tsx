import React from 'react'
import CourseSidebar from '../_components/CourseSidebar'
import { getCourseSidebarData } from '@/app/data/course/get-course-sidebar-data';

interface CourseLayoutProps {
    params: Promise<{ slug: string }>;
    children: React.ReactNode;
};

export default async function CourseLayout({ params, children }: CourseLayoutProps) {

    const { slug } = await params;

    // Server-side security check and lightweight data fetching for the sidebar
    const course = await getCourseSidebarData(slug);
    
    return (
        <div className='flex flex-1 flex-col min-h-0 gap-6 lg:flex-row'>
            {/* Sidebar */}
            <aside className='w-full shrink-0 border-b border-border pb-4 lg:w-80 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-0'>
                <div className='lg:sticky lg:top-4 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pr-4'>
                    <CourseSidebar course={course.course} />
                </div>
            </aside>

            {/* Main Content */}
            <div className='flex-1 min-w-0 overflow-hidden'>
                {children}
            </div>
        </div>
    )
}
