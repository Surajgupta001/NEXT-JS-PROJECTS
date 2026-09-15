'use client';

import { EnrolledCourseType } from '@/app/data/user/get-enrolled-courses';
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress';
import { useConstructUrl } from '@/hooks/use-construct-url';
import { useCourseProgress } from '@/hooks/use-course-progress';
import Image from 'next/image';
import Link from 'next/link';

interface CourseProgressCardProps {
    data: EnrolledCourseType
    ;
}

export default function CourseProgressCard({ data }: CourseProgressCardProps) {

    const thumbnailUrl = useConstructUrl(data.course.fileKey);
    const { completedLessons, progressPercentage, totalLessons } = useCourseProgress({ courseData: data.course });

    return (
        <Card className='relative gap-0 py-0 group'>
            <Badge className='absolute z-10 top-2 right-2'>
                {data.course.level}
            </Badge>
            <Image
                src={thumbnailUrl}
                alt={data.course.title}
                width={600}
                height={400}
                className='object-cover w-full h-full rounded-t-xl aspect-video'
            />
            <CardContent className='p-4'>
                <Link
                    href={`/dashboard/${data.course.slug}`}
                    className='text-lg font-medium transition-colors line-clamp-2 hover:underline group-hover:text-primary'
                >
                    {data.course.title}
                </Link>
                <p className='mt-2 text-sm leading-tight line-clamp-2 text-muted-foreground'>{data.course.smallDescription}</p>
                <div className='space-y-4 mt-5'>
                    <div className='flex justify-between mb-1 text-sm'>
                        <p>Progress:</p>
                        <p className='font-medium'>{progressPercentage}%</p>
                    </div>
                    <Progress value={progressPercentage} className='h-1.5' />
                    <p className='text-xs text-muted-foreground mt-1'>You have completed {completedLessons} out of {totalLessons} lessons.</p>
                </div>
                <Link href={`/dashboard/${data.course.slug}`} className={buttonVariants({ variant: "default", className: "w-full mt-4" })}>
                    Learn More
                </Link>
            </CardContent>
        </Card>
    );
}