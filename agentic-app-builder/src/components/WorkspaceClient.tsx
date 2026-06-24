import React from 'react'

export default function WorkspaceClient() {
    return (
        <div className='flex h-[calc(100vh-4rem)] overflow-hidden bg-#[0a0a0a]'>
            {/* Chat Panel - left */}
            <div className='w-[320px] shrink-0 border-r border-white/6 bg-#[0d0d0d] flex items-center justify-center'>
                <p className='text-xs text-white/20'>Chat Panel Coming Soon.</p>
            </div>
            
            {/* Code Panel - right */}
            <div className='flex flex-col items-center justify-center flex-1 overflow-hidden'>
                <p className='text-xs text-white/20'>Code Panel Coming Soon.</p>
            </div>
        </div>
    );
}
