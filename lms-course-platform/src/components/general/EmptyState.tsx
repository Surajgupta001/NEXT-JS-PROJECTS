import { Ban, PlusCircle } from 'lucide-react'
import Link from 'next/link';
import { buttonVariants } from '../ui/button';

interface EmptyStateProps {
    title: string;
    description: string;
    buttonText: string;
    href: string;
}

export default function EmptyState({ title, description, buttonText, href }: EmptyStateProps) {
    return (
        <div className='flex flex-col items-center justify-center flex-1 h-full p-8 text-center border-dashed rounded-md animate-in fade-in-50'>
            <div className='flex items-center justify-center rounded-full size-20 bg-primary/10'>
                <Ban className='size-10 text-primary' />
            </div>
            <h2 className='mt-6 text-6xl'>{title}</h2>
            <p className='mt-2 mb-8 text-sm leading-tight text-center text-muted-foreground'>{description}</p>
            <Link href={href} className={buttonVariants({ variant: "default" })}>
                <PlusCircle className='mr-2 size-6' />{buttonText}
            </Link>
        </div>
    );
}
