'use client';

import { CourseSidebarDataType } from '@/app/data/course/get-course-sidebar-data';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { ChevronDown, Play } from 'lucide-react'
import LessonItem from './LessonItem';
import { usePathname } from 'next/navigation';
import { useCourseProgress } from '@/hooks/use-course-progress';

interface CourseSidebarData {
    course: CourseSidebarDataType['course'];
};

export default function CourseSidebar({ course }: CourseSidebarData) {

    const pathname = usePathname();
    const currentLessonId = pathname?.split('/').pop();

    const { completedLessons, totalLessons, progressPercentage } = useCourseProgress({ courseData: course });

    return (
        <div className='flex flex-col h-full min-h-0'>
            <div className='p-4 border-b border-border'>
                <div className='flex items-center gap-3 mb-3'>
                    <div className='flex items-center justify-center rounded-lg size-10 bg-primary/10 shrink-0'>
                        <Play className='size-5 text-primary' />
                    </div>
                    <div className='flex-1 min-w-0'>
                        <h1 className='text-base font-semibold leading-tight truncate'>{course.title}</h1>
                        <p className='mt-1 text-xs truncate text-muted-foreground'>{course.category}</p>
                    </div>
                </div>
                <div className='space-y-2'>
                    <div className='flex justify-between text-xs'>
                        <span className='text-muted-foreground'>Progress</span>
                        <span className='font-medium'>{completedLessons}/{totalLessons} lessons</span>
                    </div>
                    <Progress value={progressPercentage} className='h-1.5' />
                    <p className='text-xs text-muted-foreground'>You have completed {completedLessons} out of {totalLessons} lessons.</p>
                </div>
            </div>
            <div className='flex-1 min-h-0 overflow-y-auto p-4 space-y-3'>
                {course.chapters.map((chapter, index) => (
                    <Collapsible key={chapter.id} defaultOpen={index === 0} className='group/collapsible'>
                        <CollapsibleTrigger
                            render={
                                <Button
                                    variant='outline'
                                    className='w-full p-3 h-auto justify-start text-left'
                                />
                            }
                        >
                            <span className='shrink-0 transition-transform duration-200 group-data-[open]/collapsible:rotate-180'>
                                <ChevronDown className='size-4 text-primary' />
                            </span>
                            <span className='flex-1 text-left min-w-0'>
                                <span className='block font-semibold text-sm truncate text-foreground'>{chapter.position}: {chapter.title}</span>
                                <span className='block text-[10px] text-muted-foreground font-medium truncate'>{chapter.lessons.length} lessons</span>
                            </span>
                        </CollapsibleTrigger>
                        <CollapsibleContent className='mt-2 ml-2 pl-4 border-l-2 space-y-1 py-1'>
                            {chapter.lessons.map((lesson) => (
                                <LessonItem
                                key={lesson.id}
                                lesson={lesson}
                                slug={course.slug}
                                isActive={currentLessonId === lesson.id}
                                completed={lesson.lessonProgress.find(
                                    (progress) => progress.lessonId === lesson.id
                                )?.completed || false}
                                />
                            ))}
                        </CollapsibleContent>
                    </Collapsible>
                ))}
            </div>
        </div>
    );
}
