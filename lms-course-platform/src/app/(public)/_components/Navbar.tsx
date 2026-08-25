'use client';

import UserDropdown from '@/app/(auth)/login/_components/UserDropdown';
import { buttonVariants } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/themeToggle';
import { authClient } from '@/lib/auth-client';
import Image from 'next/image'
import Link from 'next/link'

const navigationItems = [
    { name: 'Home', href: '/' },
    { name: 'Courses', href: '/courses' },
    { name: 'Dashboard', href: '/dashboard' },
];

export default function Navbar() {

    const { data: session, isPending } = authClient.useSession();

    return (
        <header className='sticky top-0 w-full border-b bg-background/95 backdrop-blur-[backdrop-filter]:bg-background/60'>
            <div className='container flex items-center px-4 mx-auto min-h-16 md:px-6 lg:px-8'>
                <Link href='/' className='flex items-center mr-4 space-x-2'>
                    <Image src="/white_logo_lms3.png" alt='Logo' width={36} height={36} />
                    <span className='text-lg font-bold'>LMS</span>
                </Link>
                {/* Desktop Navigation */}
                <nav className='hidden md:flex md:flex-1 md:items-center md:justify-between'>
                    <div className='flex items-center space-x-2'>
                        {navigationItems.map((item) => (
                            <Link key={item.href} href={item.href} className='text-sm font-medium transition-colors hover:text-primary'>
                                {item.name}
                            </Link>
                        ))}
                    </div>
                    <div className='flex items-center space-x-4'>
                        <ThemeToggle />
                        {isPending ? null : session ? (
                            <UserDropdown email={session.user.email} name={session.user.name} image={session.user.image || ''} />
                        ) : (
                            <>
                                <Link href='/login' className={buttonVariants({ variant: 'secondary' })}>
                                    Login
                                </Link>
                                <Link href='/login' className={buttonVariants()}>
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    )
}
