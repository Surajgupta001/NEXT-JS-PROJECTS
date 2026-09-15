'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useOptimistic, useTransition } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { courseCategories, courseLevels } from '@/lib/zodSchema';

const selectClass =
    'h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring disabled:opacity-50 dark:bg-input/30';

export default function CourseFilters() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [pending, startTransition] = useTransition();

    const current = {
        query: searchParams.get('q') ?? '',
        category: searchParams.get('category') ?? '',
        level: searchParams.get('level') ?? '',
        sort: searchParams.get('sort') ?? 'newest',
    };

    const [optimistic, setOptimistic] = useOptimistic(current, (_s, next: typeof current) => next);

    function update(next: Partial<typeof current> & { pageReset?: boolean }) {
        const merged = { ...optimistic, ...next };
        setOptimistic(merged);
        startTransition(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (merged.query) params.set('q', merged.query);
            else params.delete('q');
            if (merged.category) params.set('category', merged.category);
            else params.delete('category');
            if (merged.level) params.set('level', merged.level);
            else params.delete('level');
            if (merged.sort && merged.sort !== 'newest') params.set('sort', merged.sort);
            else params.delete('sort');
            params.delete('page');
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        });
    }

    return (
        <div className='mb-6 flex flex-col gap-3 md:flex-row md:items-center'>
            <Input
                placeholder='Search courses...'
                defaultValue={current.query}
                onChange={(e) => update({ query: e.target.value })}
                className='md:max-w-xs'
                aria-label='Search courses'
            />
            <div className='flex flex-wrap gap-2'>
                <select
                    aria-label='Filter by category'
                    className={selectClass}
                    value={optimistic.category}
                    disabled={pending}
                    onChange={(e) => update({ category: e.target.value })}
                >
                    <option value=''>All categories</option>
                    {courseCategories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
                <select
                    aria-label='Filter by level'
                    className={selectClass}
                    value={optimistic.level}
                    disabled={pending}
                    onChange={(e) => update({ level: e.target.value })}
                >
                    <option value=''>All levels</option>
                    {courseLevels.map((l) => (
                        <option key={l} value={l}>{l}</option>
                    ))}
                </select>
                <select
                    aria-label='Sort courses'
                    className={selectClass}
                    value={optimistic.sort}
                    disabled={pending}
                    onChange={(e) => update({ sort: e.target.value })}
                >
                    <option value='newest'>Newest</option>
                    <option value='title'>Title A–Z</option>
                    <option value='price-asc'>Price low → high</option>
                    <option value='price-desc'>Price high → low</option>
                </select>
                {(optimistic.query || optimistic.category || optimistic.level || optimistic.sort !== 'newest') && (
                    <Button variant='ghost' size='sm' onClick={() => update({ query: '', category: '', level: '', sort: 'newest' })}>
                        Clear
                    </Button>
                )}
            </div>
        </div>
    );
}
