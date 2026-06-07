'use client';

import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { Input } from './ui/input'
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { getFiles } from '@/lib/actions/file.actions';
import Thumbnail from './Thumbnail';
import FormattedDateTime from './FormattedDateTime';
import { useDebounce } from 'use-debounce';

function Search() {

    const searchParams = useSearchParams();
    const searchQuery = searchParams.get("query") || '';

    const [query, setQuery] = useState(searchQuery);
    const [results, setResults] = useState<FileDocument[]>([]);
    const [open, setOpen] = useState(false);

    const [prevSearchQuery, setPrevSearchQuery] = useState(searchQuery);
    if (searchQuery !== prevSearchQuery) {
        setQuery(searchQuery);
        setPrevSearchQuery(searchQuery);
    }

    const router = useRouter();
    const path = usePathname();

    const [debounceQuery] = useDebounce(query, 300);

    useEffect(() => {
        const fetchFiles = async () => {
            if (debounceQuery.length === 0) {
                setResults([]);
                setOpen(false);
                return router.push(path.replace(searchParams.toString(), ""));
            }

            const files = await getFiles({ types: [], searchText: debounceQuery });

            setResults(files.documents);
            setOpen(true);
        };

        fetchFiles();
    }, [debounceQuery, path, router, searchParams]);

    const handleClickItem = (file: FileDocument) => {
        setOpen(false);
        setResults([]);

        router.push(`/${file.type === "video" || file.type === "audio" ? "media" : file.type + "s"}?query=${query}`);
    };

    return (
        <div className='search'>
            <div className='search-input-wrapper'>
                <Image
                    src="/assets/icons/search.svg"
                    alt="Search"
                    width={24}
                    height={24}
                />
                <Input
                    placeholder="Search..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className='search-input'
                />
                {open && (
                    <ul className='search-result'>
                        {results.length > 0 ? (
                            results.map((file) =>
                                <li
                                    key={file.$id}
                                    className='flex items-center justify-between'
                                    onClick={() => handleClickItem(file)}
                                >
                                    <div className='flex items-center gap-4 cursor-pointer'>
                                        <Thumbnail
                                            type={file.type}
                                            url={file.url}
                                            extension={file.extension}
                                            className='size-9 min-w-9'
                                        />
                                        <p className='subtitle-2 line-clamp-1 text-light-100'>{file.name}</p>
                                    </div>
                                    <FormattedDateTime
                                        date={file.$createdAt}
                                        className='caption line-clamp-1 text-light-200'
                                    />
                                </li>)
                        ) : (
                            <p className='empty-result'>No files found</p>
                        )}
                    </ul>
                )}
            </div>
        </div>
    );
}


export default Search