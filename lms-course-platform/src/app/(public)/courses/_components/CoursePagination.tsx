import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PaginationProps {
    page: number;
    totalPages: number;
    buildHref: (page: number) => string;
}

export default function CoursePagination({ page, totalPages, buildHref }: PaginationProps) {
    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
        (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
    );

    return (
        <nav aria-label='Pagination' className='mt-8 flex items-center justify-center gap-2'>
            <Link
                href={buildHref(Math.max(1, page - 1))}
                aria-disabled={page <= 1}
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), page <= 1 && 'pointer-events-none opacity-50')}
            >
                Prev
            </Link>
            {pages.map((p, i) => (
                <span key={p} className='flex items-center gap-2'>
                    {i > 0 && pages[i - 1] !== p - 1 && <span className='text-muted-foreground'>…</span>}
                    <Link
                        href={buildHref(p)}
                        aria-current={p === page ? 'page' : undefined}
                        className={cn(
                            buttonVariants({ variant: p === page ? 'default' : 'outline', size: 'sm' })
                        )}
                    >
                        {p}
                    </Link>
                </span>
            ))}
            <Link
                href={buildHref(Math.min(totalPages, page + 1))}
                aria-disabled={page >= totalPages}
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), page >= totalPages && 'pointer-events-none opacity-50')}
            >
                Next
            </Link>
        </nav>
    );
}
