'use client';

import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card'
import { useConfetti } from '@/hooks/use-confetti';
import { ArrowLeftIcon, CheckIcon, } from 'lucide-react'
import Link from 'next/link';
import { useEffect } from 'react';

export default function PaymentSuccessfull() {
    const { triggerConfetti } = useConfetti();

    useEffect(() => {
        triggerConfetti();
    }, []);

    return (
        <div className='w-full min-h-screen flex flex-1 justify-center items-center'>
            <Card className='w-87.5'>
                <CardContent>
                    <div className='w-full flex justify-center'>
                        <CheckIcon className='size-12 p-2 bg-green-500/30 text-green-500 rounded-full' />
                    </div>
                    <div className='mt-3 text-center sm:mt-5 w-full'>
                        <h2 className='text-xl font-semibold'>Payment Successful</h2>
                        <p className='text-sm mt-2 text-muted-foreground tracking-tight text-balance'>Your payment has been processed successfully.</p>
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
