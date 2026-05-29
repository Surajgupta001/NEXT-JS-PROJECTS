'use client';

import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { SignInButton, useAuth, UserButton } from '@clerk/nextjs'
import { Button } from './ui/button'
import { BarLoader } from 'react-spinners';
import { useStoreUser } from '@/hooks/use-store-user';
import { Authenticated, Unauthenticated } from 'convex/react';
import { Building, Crown, Plus, Sparkles, Ticket } from "lucide-react";
import OnboardingModal from './onboarding-modal';
import { useOnboarding } from '@/hooks/use-onboarding';
import SearchLocationBar from './search-location-bar';
import { Badge } from './ui/badge';
import UpgradeModal from './upgrade-model';

function Header() {

    const { isLoading } = useStoreUser();

    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const { showOnboarding, handleOnboardingComplete, handleOnboardingSkip } = useOnboarding();

    const { has } = useAuth();
    const hasPro = has?.({ plan: 'pro' });

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
                        {hasPro && (
                            <Badge className='gap-2 ml-3 text-white bg-linear-to-r from-pink-500 to-orange-500'>
                                <Crown className='w-3 h-3' /> Pro
                            </Badge>
                        )}
                    </Link>

                    {/* Search & Location - Desktop only */}
                    <div className='justify-center flex-1 hidden md:flex'>
                        <SearchLocationBar />
                    </div>

                    {/* Right Side Actions */}
                    <div className='flex items-center'>
                        {!hasPro && (<Button variant={"ghost"} size='sm' onClick={() => setShowUpgradeModal(true)}>
                            Pricing
                        </Button>)}
                        <Button variant={"ghost"} size='sm' asChild className={'mr-2'}>
                            <Link href='explore'>Explore</Link>
                        </Button>
                        <Authenticated>

                            {/* Create Event Button */}
                            <Button size="sm" asChild className="flex gap-2 mr-4">
                                <Link href="/create-event">
                                    <Plus className="w-4 h-4" />
                                    <span className="hidden sm:inline">Create Event</span>
                                </Link>
                            </Button>

                            {/* User Button */}
                            <UserButton
                                afterSignOutUrl="/"
                                appearance={{
                                    elements: {
                                        avatarBox: "w-9 h-9",
                                    },
                                }}
                            >
                                <UserButton.MenuItems>
                                    <UserButton.Link
                                        label="My Tickets"
                                        labelIcon={<Ticket size={16} />}
                                        href="/my-tickets"
                                    />
                                    <UserButton.Link
                                        label="My Events"
                                        labelIcon={<Building size={16} />}
                                        href="/my-events"
                                    />
                                    <UserButton.Action label="manageAccount" />
                                </UserButton.MenuItems>
                            </UserButton>
                        </Authenticated>
                        <Unauthenticated>
                            <SignInButton mode='modal'>
                                <Button size='sm'>Sign In</Button>
                            </SignInButton>
                        </Unauthenticated>
                    </div>
                </div>

                {/* Mobile Search & Location - Below Header */}
                <div className='px-3 py-3 border-t md:hidden'>
                    <SearchLocationBar />
                </div>

                {/* Loader */}
                {isLoading && (
                    <div className='absolute bottom-0 left-0 w-full'>
                        <BarLoader width={'100%'} color='#a855f7' />
                    </div>
                )}
            </nav>

            {/* Modals */}
            <OnboardingModal
                isOpen={showOnboarding}
                onClose={handleOnboardingSkip}
                onComplete={handleOnboardingComplete}
            />

            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                trigger='header'
            />
        </>
    )
}

export default Header
