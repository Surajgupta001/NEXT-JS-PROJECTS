import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

function Header() {
    return (
        <>
            <nav className='fixed top-0 left-0 right-0 z-20 border-b bg-background/80 backdrop-blur-xl'>
                <div className='flex items-center justify-between px-6 py-4 mx-auto max-w-7xl'>
                    {/* Logo */}
                    <Link href={'/'} className='flex items-center'>
                        <Image
                            src='/Gatherly_1.png'
                            alt='Gatherly Logo'
                            width={900}
                            height={900}
                            className='w-auto h-14 mix-blend-lighten'
                            priority
                        />
                        {/* Pro Badge */}
                    </Link>
                    {/* Search & Location - Desktop only */}
                    {/* Right Side Actions */}
                </div>
                {/* Mobile Search & Location - Below Header */}
            </nav>
            {/* Modals */}
        </>
    )
}

export default Header