"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "./ui/button";
import { cn, getFileType } from "@/lib/utils";
import Image from "next/image";
import Thumbnail from "./Thumbnail";
import { MAX_FILE_SIZE } from "../../constants";
import { toast } from "sonner";
import { usePathname } from "next/navigation";
import { uploadFiles } from "@/lib/actions/file.actions";

interface Props {
    className?: string;
};

interface UploadingFile {
    id: string;
    file: File;
    previewUrl: string;
}

function FileUploader({ className }: Props) {

    const [files, setFiles] = useState<UploadingFile[]>([]);
    const previewUrls = useRef(new Set<string>());

    const path = usePathname();

    const removeUpload = useCallback((id: string) => {
        setFiles((prevFiles) => {
            const fileToRemove = prevFiles.find((file) => file.id === id);

            if (fileToRemove) {
                URL.revokeObjectURL(fileToRemove.previewUrl);
                previewUrls.current.delete(fileToRemove.previewUrl);
            }

            return prevFiles.filter((file) => file.id !== id);
        });
    }, []);

    useEffect(() => {
        const urls = previewUrls.current;

        return () => {
            urls.forEach((url) => URL.revokeObjectURL(url));
            urls.clear();
        };
    }, []);

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

        const uploads = validFiles.map((file) => {
            const previewUrl = URL.createObjectURL(file);
            previewUrls.current.add(previewUrl);

            return {
                id: crypto.randomUUID(),
                file,
                previewUrl,
            };
        });

        setFiles((prevFiles) => [...prevFiles, ...uploads]);

        const uploadPromises = uploads.map(
            async (upload) => {
                try {
                    const uploadedFile = await uploadFiles({ file: upload.file, path });

                    if (uploadedFile) {
                        toast.success("File uploaded", {
                            description: (
                                <p className="body-2">
                                    <span className="font-semibold">{upload.file.name}</span> uploaded successfully.
                                </p>
                            )
                        });
                    }
                } catch {
                    toast.error("Upload failed", {
                        description: (
                            <p className="body-2">
                                Could not upload <span className="font-semibold">{upload.file.name}</span>.
                            </p>
                        ),
                    });
                } finally {
                    removeUpload(upload.id);
                }
            }
        );
        await Promise.all(uploadPromises);
    }, [path, removeUpload]);

    const { getRootProps, getInputProps } = useDropzone({ onDrop, maxSize: MAX_FILE_SIZE });

    const handleRemoveFile = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
        e.stopPropagation();

        removeUpload(id);
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
                    {files.map(({ id, file, previewUrl }) => {
                        const { type, extension } = getFileType(file.name);
                        return (
                            <li key={id} className="uploader-preview-item">
                                <div className='flex items-center gap-3 flex-1 min-w-0'>
                                    <Thumbnail
                                        type={type}
                                        extension={extension}
                                        url={previewUrl}
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
                                <button
                                    type="button"
                                    className="cursor-pointer"
                                    onClick={(e) => handleRemoveFile(e, id)}
                                    aria-label={`Remove ${file.name}`}
                                >
                                    <Image
                                        src="/assets/icons/remove.svg"
                                        width={24}
                                        height={24}
                                        alt=""
                                    />
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

export default FileUploader
