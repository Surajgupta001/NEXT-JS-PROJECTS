import { ArrowRight, Zap } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import { Button } from './ui/button'
import { PricingModal } from './PricingModal'
import { checkUser } from '@/lib/checkUser'
import { PLANS } from '@/lib/constants'
import { Plan } from '../../types/plan'

export default async function Header() {

    const user = await checkUser();

    return (
        <header className='fixed top-0 left-0 z-50 w-full h-16 border-b border-white/6 text-white/7 backdrop-blur-md'>
            <nav className='flex items-center justify-between h-full mx-auto max-w-7xl sm:px-6'>
                <Link href='/'>
                    <Image
                        src={'/logo.png'}
                        alt='Agentic App Builder Logo'
                        width={100}
                        height={100}
                        className='w-auto rounded-md h-9'
                    />
                </Link>
                <div className='flex items-center gap-5'>
                    <Show when="signed-in">
                        <Link
                            href={'/projects'}
                            className='text-[13px] font-medium text-white/40 transition-colors hover:text-white/80'
                        >
                            Projects
                        </Link>
                        {user && (
                            <PricingModal>
                                <span className='inline-flex h-8 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 text-xs text-white/70'>
                                    <Zap className='w-3 h-3 fill-white/70' /> {user.credits}/ {PLANS[user?.plan as Plan].credits} credits
                                </span>
                            </PricingModal>
                        )}
                        <UserButton />
                    </Show>
                    <Show when="signed-out">
                        <SignInButton mode='modal'>
                            <Button variant='ghost' size='sm' className='text-[13px] font-medium text-white/40 transition-colors hover:text-white/80'>
                                Sign In
                            </Button>
                        </SignInButton>
                        <SignUpButton mode='modal'>
                            <Button className='h-8 px-4 pt-1 font-semibold rounded-full active:scale-95'>
                                Get Started
                                <ArrowRight className='w-3 h-3 opacity-60' />
                            </Button>
                        </SignUpButton>
                    </Show>
                </div>
            </nav>
        </header>
    )
}
