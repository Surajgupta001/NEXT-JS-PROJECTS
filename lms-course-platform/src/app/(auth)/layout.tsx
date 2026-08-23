import { buttonVariants } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link'
import React from 'react'

export default function layout({ children }: { children: React.ReactNode }) {
    return (
        <div className='relative flex flex-col items-center justify-center min-h-svh'>
            <Link href='/' className={buttonVariants({
                variant: 'outline',
                className: 'absolute top-4 left-4'
            })}>
                <ArrowLeft size={4} /> Back
            </Link>
            <div className='flex flex-col w-full max-w-sm gap-6'>
                <Link href='/' className='flex items-center self-center gap-2 font-medium'>
                    <Image src='/white_logo_lms3.png' alt='LMS Logo' width={80} height={80} style={{ width: 'auto', height: 'auto' }} />
                    <span className='text-2xl font-extrabold'>LMS</span>
                </Link>
                {children}
                <div className='text-xs text-center text-balance text-muted-foreground'>
                    By clicking continue, you agree to our <span className='hover:text-primary hover:underline'>Terms of Service</span> {' '} and <span className='hover:text-primary hover:underline'>Privacy Policy</span>.
                </div>
            </div>
        </div>
    );
};
