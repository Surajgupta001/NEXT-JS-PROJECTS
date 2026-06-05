'use client';

import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from './ui/button';
import { cn, convertFileToUrl, getFileType } from '@/lib/utils';
import Image from 'next/image';
import Thumbnail from './Thumbnail';
import { MAX_FILE_SIZE } from '../../constants';
import { toast } from 'sonner';
import { usePathname } from 'next/navigation';
import { uploadFiles } from '@/lib/actions/file.actions';

interface Props {
    ownerId: string;
    accountId: string;
    className?: string;
};

function FileUploader({ ownerId, accountId, className }: Props) {

    const [files, setFiles] = useState<File[]>([]);

    const path = usePathname();

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const validFiles = acceptedFiles.filter((file) => {
            if (file.size > MAX_FILE_SIZE) {
                toast.error("File too large", {
                    description: (
                        <p className="body-2">
                            <span className="font-semibold">{file.name}</span> is too large. Max file size is 50MB.
                        </p>
                    ),
                });
                return false;
            }
            return true;
        });

        setFiles((prevFiles) => [...prevFiles, ...validFiles]);

        const uploadPromises = validFiles.map(
            async (file) => {
                return uploadFiles({ file, ownerId, accountId, path })
                    .then((uploadedFile) => {
                        if (uploadedFile) {
                            setFiles((prevFiles) => prevFiles.filter((f) => f.name !== file.name));
                            toast.success("File uploaded", {
                                description: (
                                    <p className="body-2">
                                        <span className="font-semibold">{file.name}</span> uploaded successfully.
                                    </p>
                                )
                            });
                        }
                    });
            }
        );
        await Promise.all(uploadPromises);
    }, [accountId, ownerId, path]);

    const { getRootProps, getInputProps } = useDropzone({ onDrop })

    const handleRemoveFile = (e: React.MouseEvent<HTMLImageElement, MouseEvent>, fileName: string) => {
        e.stopPropagation();

        setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
    };

    return (
        <div {...getRootProps()} className='cursor-pointer'>
            <input {...getInputProps()} />
            <Button
                type='button'
                className={cn('uploader-button', className)}
            >
                <Image
                    src="/assets/icons/upload.svg"
                    alt="Upload"
                    width={24}
                    height={24}
                />
                <p>Upload Files</p>
            </Button>
            {files.length > 0 && (
                <ul className='uploader-preview-list'>
                    <h4 className='h4 text-light-100'>Uploading</h4>
                    {files.map((file, index) => {
                        const { type, extension } = getFileType(file.name);
                        return (
                            <li key={`${file.name}-${index}`} className="uploader-preview-item">
                                <div className='flex items-center gap-3 flex-1 min-w-0'>
                                    <Thumbnail
                                        type={type}
                                        extension={extension}
                                        url={convertFileToUrl(file)}
                                    />
                                    <div className='flex flex-col flex-1 min-w-0'>
                                        <div className='flex items-center gap-2'>
                                            <p className='preview-item-name !mb-0'>{file.name}</p>
                                            <Image
                                                src="/assets/icons/file-loader.gif"
                                                alt="Loading"
                                                width={80}
                                                height={26}
                                                className="shrink-0"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <Image
                                    src="/assets/icons/remove.svg"
                                    width={24}
                                    height={24}
                                    alt="Remove"
                                    className="cursor-pointer"
                                    onClick={(e) => handleRemoveFile(e, file.name)}
                                />
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

export default FileUploader