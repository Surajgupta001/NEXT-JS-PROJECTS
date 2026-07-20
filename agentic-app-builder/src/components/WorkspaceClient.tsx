'use client';

import React, { useCallback } from 'react'
import CodePanel from './CodePanel';
import { FileData, StatusStep } from '../../types/workspace';

export default function WorkspaceClient() {

    const [fileData, setFileData] = React.useState<FileData | null>(null);
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [statusLog, setStatusLog] = React.useState<StatusStep[]>([]);

    const handleFilePatch = useCallback((patches: FileData) => {
        setFileData(patches);
    }, []);

    return (
        <div className='flex h-[calc(100vh-4rem)] overflow-hidden bg-#[0a0a0a]'>
            {/* Chat Panel - left */}
            <div className='w-[320px] shrink-0 border-r border-white/6 bg-#[0d0d0d] flex items-center justify-center'>
                <p className='text-xs text-white/20'>Chat Panel Coming Soon.</p>
            </div>

            {/* Code Panel - right */}
            <CodePanel
                fileData={fileData}
                isGenerating={isGenerating}
                statusLog={statusLog}
                onFilePatch={handleFilePatch}
            />
        </div>
    );
}
