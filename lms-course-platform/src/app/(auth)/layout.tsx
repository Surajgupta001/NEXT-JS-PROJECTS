import React from 'react'

export default function layout({ children }: { children: React.ReactNode }) {
    return (
        <div className='relative flex flex-col items-center justify-center min-h-svh'>
            <div className='flex flex-col w-full max-w-sm gap-6'>
                {children}
            </div>
        </div>
    );
};
