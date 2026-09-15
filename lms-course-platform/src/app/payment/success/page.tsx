'use client';

import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card'
import { useConfetti } from '@/hooks/use-confetti';
import { tryCatch } from '@/hooks/try-catch';
import { ArrowLeftIcon, CheckIcon, } from 'lucide-react'
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { verifyPaymentAndActivate } from './action';

export default function PaymentSuccessfull() {
    return (
        <Suspense fallback={<div className='w-full min-h-screen flex flex-1 justify-center items-center'>Verifying payment...</div>}>
            <PaymentSuccessContent />
        </Suspense>
    );
}

function PaymentSuccessContent() {
    const { triggerConfetti } = useConfetti();
    const searchParams = useSearchParams();
    const router = useRouter();
    const sessionId = searchParams.get('session_id');
    const [verifying, setVerifying] = useState(!!sessionId);

    useEffect(() => {
        triggerConfetti();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!sessionId) return;

        (async () => {
            const { data: result, error } = await tryCatch(verifyPaymentAndActivate(sessionId));

            setVerifying(false);

            if (error || !result) {
                toast.error('Payment succeeded, but enrollment verification failed. It will complete shortly.');
                return;
            }

            if (result.status === 'success') {
                toast.success('You are now enrolled! Redirecting to dashboard...');
                router.refresh();
            } else if (result.status === 'pending') {
                toast.message('Payment is still processing. Check dashboard in a moment.');
            } else {
                toast.error(result.message);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionId]);

    return (
        <div className='w-full min-h-screen flex flex-1 justify-center items-center'>
            <Card className='w-87.5'>
                <CardContent>
                    <div className='w-full flex justify-center'>
                        <CheckIcon className='size-12 p-2 bg-green-500/30 text-green-500 rounded-full' />
                    </div>
                    <div className='mt-3 text-center sm:mt-5 w-full'>
                        <h2 className='text-xl font-semibold'>Payment Successful</h2>
                        <p className='text-sm mt-2 text-muted-foreground tracking-tight text-balance'>{verifying ? 'Verifying your enrollment...' : 'Your payment has been processed successfully.'}</p>
                        <Link href='/dashboard' className={buttonVariants({ className: 'mt-4 w-full' })}>
                            <ArrowLeftIcon className='size-5' />
                            Go to Dashboard
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
