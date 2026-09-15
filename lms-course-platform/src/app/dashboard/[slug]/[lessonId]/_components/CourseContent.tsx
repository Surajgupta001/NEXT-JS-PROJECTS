'use client';

import { LessonContentType } from '@/app/data/course/get-lesson-content'
import { RenderDescription } from '@/components/rich-text-editor/RenderDescription';
import { Button } from '@/components/ui/button';
import { tryCatch } from '@/hooks/try-catch';
import { useConstructUrl } from '@/hooks/use-construct-url';
import { ArrowLeft, ArrowRight, BookIcon, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useTransition } from 'react';
import { markLessonAsComplete } from '../action';
import { toast } from 'sonner';
import { useConfetti } from '@/hooks/use-confetti';

interface CourseContentProps {
    data: LessonContentType;
};

const STORAGE_PREFIX = 'lms:video:';

export default function CourseContent({ data }: CourseContentProps) {

    const [pending, startTransition] = useTransition();
    const { triggerConfetti } = useConfetti();
    const isCompleted = data.lessonProgress.length > 0;
    const slug = data.chapter.course.slug;

    function onSubmit() {
        startTransition(async () => {
            const { data: result, error } = await tryCatch(markLessonAsComplete(data.id, slug));

            if (error) {
                toast.error(error.message);
                return;
            }

            if (result.status === 'success') {
                toast.success('Lesson marked as complete!');
                triggerConfetti();
            } else if (result.status === 'error') {
                toast.error(result.message);
            }
        })
    };

    function handleVideoEnded() {
        if (!isCompleted) {
            onSubmit();
        }
    }

    return (
        <div className='flex flex-col h-full bg-background pl-6'>
            <VideoPlayer
                lessonId={data.id}
                thumbnailKey={data.thumbnailKey ?? ''}
                videoKey={data.videoKey ?? ''}
                onEnded={handleVideoEnded}
            />
            <div className='py-4 border-b flex flex-wrap items-center gap-3'>
                {isCompleted ? (
                    <Button variant='outline' className='bg-green-500/10 text-green-500 hover:text-green-60'>
                        <CheckCircle className='size-4 mr-2 text-green-500' />
                        Completed
                    </Button>
                ) : (
                    <Button variant='outline' onClick={onSubmit} disabled={pending}>
                        <CheckCircle className='size-4 mr-2 text-green-500' />
                        {pending ? 'Saving...' : 'Mark as Complete'}
                    </Button>
                )}
                <div className='ml-auto flex gap-2'>
                    {data.prevLesson ? (
                        <Link href={`/dashboard/${slug}/${data.prevLesson.id}`}>
                            <Button variant='outline' size='sm'>
                                <ArrowLeft className='size-4 mr-1' />
                                Prev
                            </Button>
                        </Link>
                    ) : null}
                    {data.nextLesson ? (
                        <Link href={`/dashboard/${slug}/${data.nextLesson.id}`}>
                            <Button variant='default' size='sm'>
                                Next
                                <ArrowRight className='size-4 ml-1' />
                            </Button>
                        </Link>
                    ) : null}
                </div>
            </div>
            <div className='space-y-3 pt-3'>
                <h1 className='text-3xl font-bold tracking-tight text-foreground'>{data.title}</h1>
                {data.description && (
                    <RenderDescription json={JSON.parse(data.description)} />
                )}
            </div>
        </div>
    );
}

function VideoPlayer({ lessonId, thumbnailKey, videoKey, onEnded }: { lessonId: string; thumbnailKey: string; videoKey: string; onEnded?: () => void; }) {
    const videoUrl = useConstructUrl(videoKey);
    const thumbnailUrl = useConstructUrl(thumbnailKey);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Resume from last position
    useEffect(() => {
        const el = videoRef.current;
        if (!el) return;
        try {
            const saved = localStorage.getItem(`${STORAGE_PREFIX}${lessonId}`);
            if (saved) {
                const t = parseFloat(saved);
                if (Number.isFinite(t) && t > 0) {
                    const apply = () => {
                        try {
                            if (t < (el.duration || Infinity) - 5) el.currentTime = t;
                        } catch { /* ignore */ }
                    };
                    if (el.readyState >= 1) apply();
                    else el.addEventListener('loadedmetadata', apply, { once: true });
                }
            }
        } catch { /* private mode */ }
    }, [lessonId, videoUrl]);

    function handleTimeUpdate() {
        const el = videoRef.current;
        if (!el || !el.duration) return;
        // Don't save the last few seconds — restart fresh next time
        if (el.duration - el.currentTime < 5) {
            try { localStorage.removeItem(`${STORAGE_PREFIX}${lessonId}`); } catch { /* ignore */ }
            return;
        }
        try { localStorage.setItem(`${STORAGE_PREFIX}${lessonId}`, String(el.currentTime)); } catch { /* ignore */ }
    }

    if (!videoKey) {
        return (
            <div className='aspect-video bg-muted rounded-lg flex items-center justify-center flex-col'>
                <BookIcon className='size-16 text-primary mx-auto mb-4' />
                <p className='text-muted-foreground'>This lesson does not have a video yet.</p>
            </div>
        );
    }

    return (
        <div className='aspect-video bg-black rounded-lg relative overflow-hidden'>
            <video
                ref={videoRef}
                src={videoUrl}
                className='w-full h-full object-cover'
                controls
                playsInline
                preload='metadata'
                poster={thumbnailUrl || undefined}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => {
                    try { localStorage.removeItem(`${STORAGE_PREFIX}${lessonId}`); } catch { /* ignore */ }
                    onEnded?.();
                }}
            >
                <source src={videoUrl} type='video/mp4' />
                Your browser does not support the video tag.
            </video>
        </div>
    );
}
