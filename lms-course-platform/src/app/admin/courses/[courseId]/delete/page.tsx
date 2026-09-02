'use client';

import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { tryCatch } from '@/hooks/try-catch';
import Link from 'next/link';
import { useTransition } from 'react'
import { deleteCourse } from './action';
import { toast } from 'sonner';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, Trash2 } from 'lucide-react';

export default function DeleteCoursePage() {

    const [pending, startTransition] = useTransition();
    const { courseId } = useParams<{ courseId: string }>();
    const router = useRouter();

    function onSubmit() {
        const confirmed = window.confirm(
            "Are you sure you want to delete this course? This action cannot be undone."
        );

        if (!confirmed) {
            return;
        }

        startTransition(async () => {
            const { data: result, error } = await tryCatch(deleteCourse(courseId));

            if (error) {
                toast.error("An error occurred while deleting the course");
                return;
            }

            if (result.status === "success") {
                toast.success(result.message);
                router.push("/admin/courses");
            } else if (result.status === "error") {
                toast.error(result.message);
            }
        });
    }

    return (
        <div className='w-full max-w-xl mx-auto'>
            <Card className='m-32'>
                <CardHeader>
                    <CardTitle>Are you sure you want to delete this course?</CardTitle>
                    <CardDescription>This action cannot be undone.</CardDescription>
                </CardHeader>
                <CardContent className='flex items-center justify-between'>
                    <Link href='/admin/courses' className={buttonVariants({
                        variant: "outline",
                        className: "mr-4",
                    })}>
                        Cancel
                    </Link>
                    <Button variant="destructive" onClick={onSubmit} disabled={pending}>
                        {pending ? (
                            <>
                                <Loader2 className="size-4 animate-spin" /> Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="size-4" /> Delete
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
