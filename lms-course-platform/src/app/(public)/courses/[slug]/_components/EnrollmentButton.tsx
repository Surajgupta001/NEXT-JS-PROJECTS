'use client';

import { Button } from '@/components/ui/button';
import { tryCatch } from '@/hooks/try-catch';
import { useTransition } from 'react';
import { enrollInCourseAction } from '../action';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function EnrollmentButton({ courseId }: { courseId: string }) {
    const [pending, startTransition] = useTransition();
    const router = useRouter();

    function onSubmit() {
        startTransition(async () => {
            const { data: result, error } = await tryCatch(enrollInCourseAction(courseId));

            if (error) {
                toast.error('An error occurred while enrolling in the course.');
                return;
            }

            if (!result) {
                toast.error('An error occurred while enrolling in the course.');
                return;
            }

            if (result.status === 'success') {
                // Already enrolled (no checkout URL) -> go to dashboard so
                // the button becomes "Watch Now" / course shows as enrolled.
                if (!('checkoutUrl' in result) || !result.checkoutUrl) {
                    toast.success(result.message);
                    router.push('/dashboard');
                    router.refresh();
                    return;
                }

                toast.success(result.message);
                // Full redirect to Stripe Checkout (outside Next router)
                window.location.href = result.checkoutUrl as string;
            } else if (result.status === 'error') {
                toast.error(result.message);
            }
        });
    };

    return (
        <Button onClick={onSubmit} disabled={pending} className="w-full">
            {pending ? (
                <>
                    <Loader2 className='size-4 animate-spin' />
                    Loading...
                </>
            ) : (
                'Enroll Now!'
            )}
        </Button>
    );
}
