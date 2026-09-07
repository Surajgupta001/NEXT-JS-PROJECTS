import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeftIcon, XIcon } from 'lucide-react'
import Link from 'next/link';
import React from 'react'

export default function PaymentCancelled() {
    return (
        <div className='w-full min-h-screen flex flex-1 justify-center items-center'>
            <Card className='w-87.5'>
                <CardContent>
                    <div className='w-full flex justify-center'>
                        <XIcon className='size-12 p-2 bg-red-500/30 text-red-500 rounded-full' />
                    </div>
                    <div className='mt-3 text-center sm:mt-5 w-full'>
                        <h2 className='text-xl font-semibold'>Payment Cancelled</h2>
                        <p className='text-sm mt-2 text-muted-foreground tracking-tight text-balance'>No worries, you won&apos;t be charged. please try again later.</p>
                        <Link href='/' className={buttonVariants({ className: 'mt-4 w-full' })}>
                        <ArrowLeftIcon className='size-5' />
                            Go back to HomePage
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
