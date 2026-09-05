import { PublicCourseType } from '@/app/data/course/get-all-courses'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton';
import { useConstructUrl } from '@/hooks/use-construct-url';
import { School, TimerIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface PublicCourseCardProps {
    data: PublicCourseType;
}

export default function PublicCourseCard({ data }: PublicCourseCardProps) {

    const thumbnailUrl = useConstructUrl(data.fileKey);

    return (
        <Card className='relative gap-0 py-0 group'>
            <Badge className='absolute z-10 top-2 right-2'>
                {data.level}
            </Badge>
            <Image
                src={thumbnailUrl}
                alt={data.title}
                width={600}
                height={400}
                className='object-cover w-full h-full rounded-t-xl aspect-video'
            />
            <CardContent className='p-4'>
                <Link
                    href={`/course/${data.slug}`}
                    className='text-lg font-medium transition-colors line-clamp-2 hover:underline group-hover:text-primary'
                >
                    {data.title}
                </Link>
                <p className='mt-2 text-sm leading-tight line-clamp-2 text-muted-foreground'>{data.smallDescription}</p>
                <div className='flex items-center mt-4 gap-x-5'>
                    <div className='flex items-center gap-x-2'>
                        <TimerIcon className='p-1 rounded-md size-6 text-primary bg-primary/10' />
                        <p className='text-sm text-muted-foreground'>{data.duration}</p>
                    </div>
                    <div className='flex items-center gap-x-2'>
                        <School className='p-1 rounded-md size-6 text-primary bg-primary/10' />
                        <p className='text-sm text-muted-foreground'>{data.category}</p>
                    </div>
                </div>
                <Link href={`/course/${data.slug}`} className={buttonVariants({ variant: "default", className: "w-full mt-4" })}>
                    Learn More
                </Link>
            </CardContent>
        </Card>
    );
}

export function PublicCourseCardSkeleton() {
    return (
        <Card className='relative gap-0 py-0 group'>
            <div className='absolute z-10 flex items-center top-2 right-2'>
                <Skeleton className='w-20 h-6 rounded-md' />
            </div>
            <div className='relative w-full h-fit'>
                <Skeleton className='w-full rounded-t-xl aspect-video' />
            </div>
            <CardContent className='p-4'>
                <div>
                    <Skeleton className='w-full h-6' />
                    <Skeleton className='w-3/4 h-6' />
                </div>
                <div className='mt-4 flex items-center gap-x-5'>
                    <div className='flex items-center gap-x-2'>
                        <Skeleton className='sixe-6 rounded-md' />
                        <Skeleton className='h-4 w-8' />
                    </div>
                    <div className='flex items-center gap-x-2'>
                        <Skeleton className='sixe-6 rounded-md' />
                        <Skeleton className='h-4 w-8' />
                    </div>
                </div>
                <Skeleton className='w-full h-10 mt-4 rounded-md' />
            </CardContent>
        </Card>
    );
}