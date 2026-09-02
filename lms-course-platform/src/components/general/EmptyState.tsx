import { BookOpen, PlusCircle } from 'lucide-react';
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
        <div className="flex items-center justify-center flex-1 p-6">
            <div className="flex flex-col items-center justify-center w-full max-w-lg px-6 py-12 text-center border border-dashed shadow-sm rounded-xl bg-card/50">
                {/* Icon */}
                <div className="flex items-center justify-center rounded-full size-20 bg-primary/10">
                    <BookOpen className="size-10 text-primary" />
                </div>

                {/* Content */}
                <h2 className="mt-6 text-3xl font-semibold tracking-tight">
                    {title}
                </h2>

                <p className="max-w-md mt-3 text-sm leading-6 text-muted-foreground">
                    {description}
                </p>

                {/* Action */}
                <Link
                    href={href}
                    className={buttonVariants({
                        variant: 'default',
                        className: 'mt-8 gap-2',
                    })}
                >
                    <PlusCircle className="size-5" />
                    {buttonText}
                </Link>
            </div>
        </div>
    );
}