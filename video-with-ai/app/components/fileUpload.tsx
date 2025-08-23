"use client";
import { upload } from "@imagekit/next";
import { useRef, useState } from "react";

interface FileUploadProps {
    onSuccess: (res: unknown) => void;
    onprogress?: (progress: number) => void;
    fileType?: 'image' | 'video';
};

const FileUpload = ({
    onSuccess,
    onprogress,
    fileType
}: FileUploadProps) => {

    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState<number>(0);
    const inputRef = useRef<HTMLInputElement | null>(null);

    // Optional Validation

    const validateFile = (file: File) => {
        if (fileType === 'video') {
            if (!file.type.startsWith('video/')) {
                setError('Please upload a valid video file');
                return false;
            }
        }
        if (file.size > 100 * 1024 * 1024) {
            setError('File size exceeds 100MB');
            return false;
        }
        setError(null);
        return true;
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file || !validateFile(file)) return;

        setUploading(true);
        setError(null);

        try {
            const authRes = await fetch('/api/auth/imagekit-auth');
            const auth = await authRes.json();

            const response = await upload({
                file,
                fileName: file.name,
                expire: auth.expire,
                token: auth.token,
                signature: auth.signature,
                publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY!,
                onProgress: (event) => {
                    if (event.lengthComputable) {
                        const percentage = (event.loaded / event.total) * 100;
                        const rounded = Math.round(percentage);
                        setProgress(rounded);
                        if (onprogress) onprogress(rounded);
                    }
                },
            });

            onSuccess(response);

        } catch (error) {
            console.error('Upload error:', error);
            setError('Upload failed. Please try again.');
        } finally {
            setUploading(false);
            setTimeout(() => setProgress(0), 500);
        }
    };

    return (
        <div className="w-full">
            <div className="flex flex-col items-center gap-3">
                {/* Hidden native input */}
                <input ref={inputRef} onChange={handleFileChange} type='file' accept={fileType === 'video' ? 'video/*' : 'image/*'} className="hidden" disabled={uploading} />

                {/* Upload surface */}
                <div className="w-full max-w-lg">
                    <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="w-full px-6 py-8 text-center bg-white border border-gray-300 border-dashed rounded-xl dark:border-neutral-700 dark:bg-neutral-900 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60" aria-label={`Choose ${fileType ?? 'file'} to upload`} >
                        <div className="space-y-2">
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                Click to choose a {fileType ?? 'file'} to upload
                            </p>
                            <p className="text-xs text-gray-400 dark:text-neutral-400">
                                {fileType === 'video' ? 'MP4, WebM up to 100MB' : 'PNG, JPG, WebP up to 100MB'}
                            </p>
                        </div>
                    </button>
                </div>

                {/* Progress */}
                {(uploading || progress > 0) && (
                    <div className="w-full max-w-lg">
                        <div className="w-full h-2 overflow-hidden bg-gray-200 rounded-full dark:bg-neutral-800">
                            <div className="h-full transition-all bg-blue-600" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="mt-1 text-xs text-right text-gray-500 dark:text-neutral-400">{progress}%</div>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="w-full max-w-lg text-sm text-red-600 dark:text-red-400">{error}</div>
                )}
            </div>
        </div>
    );
};

export default FileUpload;