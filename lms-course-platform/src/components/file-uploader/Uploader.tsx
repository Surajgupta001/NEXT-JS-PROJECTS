"use client";

import { useCallback, useRef, useState } from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import { ImageKitAbortError, ImageKitInvalidRequestError, ImageKitServerError, ImageKitUploadNetworkError, upload } from "@imagekit/next";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { Card, CardContent } from "../ui/card";
import { cn } from "@/lib/utils";
import RenderEmptyState, { RenderErrorState, RenderUploadedState, RenderUploadingState } from "./RenderState";

interface UploaderProps {
    value?: string;
    onChange?: (value: string) => void;
}

interface UploaderState {
    id: string | null;
    file: File | null;
    uploading: boolean;
    progress: number;
    key?: string;
    fileId?: string;
    url?: string;
    isDeleting: boolean;
    error: boolean;
    objectUrl?: string;
    fileType: "image" | "video";
}

const initialState: UploaderState = {
    id: null,
    file: null,
    uploading: false,
    progress: 0,
    key: undefined,
    fileId: undefined,
    url: undefined,
    isDeleting: false,
    error: false,
    objectUrl: undefined,
    fileType: "image",
};

export default function Uploader({ value, onChange }: UploaderProps) {
    const [fileState, setFileState] = useState<UploaderState>(() => ({
        ...initialState,
        key: value,
    }));

    const fileRef = useRef<File | null>(null);

    /*
     * Revoke local blob URL
     */
    const revokeObjectUrl = useCallback((url?: string) => {
        if (url?.startsWith("blob:")) {
            URL.revokeObjectURL(url);
        }
    }, []);

    /*
     * Upload file to ImageKit
     */
    const uploadFile = useCallback(async (file: File) => {
        setFileState((prevState) => ({
            ...prevState,
            uploading: true,
            progress: 0,
            error: false,
        }));

        try {
            /*
             * STEP 1
             * Get ImageKit authentication parameters
             */
            const authResponse = await fetch("/api/imagekit/upload", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!authResponse.ok) {
                throw new Error("Failed to authenticate with ImageKit");
            }

            const { token, expire, signature, publicKey } = await authResponse.json();

            /*
             * STEP 2
             * Upload directly to ImageKit
             */
            const result = await upload({
                file,
                fileName: file.name,
                token,
                expire,
                signature,
                publicKey,
                folder: "/lms/courses/thumbnails",
                useUniqueFileName: true,
                onProgress: (event) => {
                    if (!event.total) return;

                    const progress = Math.round((event.loaded / event.total) * 100);

                    setFileState(
                        (prevState) => ({
                            ...prevState,
                            progress,
                        })
                    );
                },
            });

            /*
             * ImageKit can return filePath
             * as undefined.
             */
            if (!result.filePath) {
                throw new Error("ImageKit did not return a file path");
            }

            /*
             * STEP 3
             * Upload successful
             */
            setFileState((prevState) => ({
                ...prevState,
                uploading: false,
                progress: 100,
                key: result.filePath,
                fileId: result.fileId,
                url: result.url,
                error: false,
            }));

            /*
             * Send file path to React Hook Form
             */
            onChange?.(result.filePath);

            toast.success("File uploaded successfully!");
        } catch (error) {
            console.error("ImageKit upload error:", error);

            if (error instanceof ImageKitAbortError) {
                toast.error(`Upload aborted: ${error.reason}`);
            } else if (error instanceof ImageKitInvalidRequestError) {
                toast.error(`Invalid upload request: ${error.message}`);
            } else if (error instanceof ImageKitUploadNetworkError) {
                toast.error(`Network error: ${error.message}`);
            } else if (error instanceof ImageKitServerError) {
                toast.error(`ImageKit server error: ${error.message}`);
            } else if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Failed to upload file.");
            }

            setFileState((prevState) => ({
                ...prevState,
                uploading: false,
                progress: 0,
                error: true,
            }));
        }
    },
        [onChange]
    );

    /*
     * Handle dropped / selected file
     */
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];

        /*
         * Remove previous local preview
         */
        revokeObjectUrl(fileState.objectUrl);

        /*
         * Create local preview immediately
         */
        const objectUrl = URL.createObjectURL(file);

        fileRef.current = file;

        setFileState({
            id: uuidv4(),
            file,
            uploading: true,
            progress: 0,
            key: undefined,
            fileId: undefined,
            url: undefined,
            isDeleting: false,
            error: false,
            objectUrl,
            fileType: "image",
        });

        uploadFile(file);
    }, [fileState.objectUrl, revokeObjectUrl, uploadFile]);

    /*
     * Delete uploaded file from ImageKit
     */
    const handleRemoveFile = useCallback(async () => {
        if (fileState.isDeleting || !fileState.fileId) return;

        try {
            setFileState(
                (prevState) => ({
                    ...prevState,
                    isDeleting: true,
                }),
            );

            const response = await fetch("/api/imagekit/delete", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    fileId: fileState.fileId,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to delete file from ImageKit");
            }

            /*
             * Remove local preview
             */
            revokeObjectUrl(fileState.objectUrl);

            fileRef.current = null;

            /*
             * Clear React Hook Form value
             */
            onChange?.("");

            /*
             * Reset uploader
             */
            setFileState({
                ...initialState,
            });

            toast.success("File removed successfully!");
        } catch (error) {
            console.error("ImageKit delete error:", error);

            setFileState(
                (prevState) => ({
                    ...prevState,
                    isDeleting: false,
                })
            );

            toast.error("Failed to delete file.");
        }
    }, [fileState.fileId, fileState.isDeleting, fileState.objectUrl, onChange, revokeObjectUrl]);

    /*
     * Retry failed upload
     */
    const handleRetry = useCallback(() => {
        if (!fileRef.current) return;

        setFileState((prevState) => ({
            ...prevState,
            uploading: true,
            progress: 0,
            error: false,
        }));

        uploadFile(fileRef.current);
    }, [uploadFile]);

    /*
     * Handle rejected files
     */
    const rejectedFiles = useCallback((fileRejections: FileRejection[]) => {
        if (fileRejections.length === 0) return;

        const tooManyFiles = fileRejections.find(
            (rejection) => rejection.errors.some(
                (error) => error.code === "too-many-files"
            )
        );

        const fileSize = fileRejections.find(
            (rejection) => rejection.errors.some(
                (error) => error.code === "file-too-large"
            )
        );

        const invalidType = fileRejections.find(
            (rejection) => rejection.errors.some(
                (error) => error.code === "file-invalid-type"
            )
        );

        if (fileSize) {
            toast.error("File size exceeds the 5MB limit.");
        }

        if (tooManyFiles) {
            toast.error("You can only upload one file at a time.");
        }

        if (invalidType) {
            toast.error("Only JPG, JPEG, PNG, and WEBP images are allowed.");
        }
    },
        []
    );

    /*
     * Render uploader state
     */
    function renderContent() {
        /*
         * Uploading
         */
        if (fileState.uploading) {
            if (!fileState.file || !fileState.objectUrl) return null;

            return (
                <RenderUploadingState
                    progress={fileState.progress}
                    file={fileState.file}
                    previewUrl={fileState.objectUrl}
                />
            );
        }

        /*
         * Error
         */
        if (fileState.error) {
            return (
                <RenderErrorState onRetry={handleRetry} />
            );
        }

        /*
         * Uploaded
         */
        if (fileState.objectUrl) {
            return (
                <RenderUploadedState
                    previewUrl={fileState.objectUrl}
                    isDeleting={fileState.isDeleting}
                    handleRemoveFile={handleRemoveFile}
                />
            );
        }

        /*
         * Empty
         */
        return (
            <RenderEmptyState
                isDragActive={isDragActive}
            />
        );
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "image/*": [".jpeg", ".jpg", ".png", ".webp"],
        },

        maxFiles: 1,
        maxSize: 5 * 1024 * 1024,
        multiple: false,
        onDropRejected: rejectedFiles,
        disabled: fileState.uploading || !!fileState.objectUrl,
    });

    return (
        <Card
            {...getRootProps()}
            className={cn(
                "relative h-64 w-full cursor-pointer border-2 border-dashed transition-colors duration-200 ease-in-out",
                isDragActive
                    ? "border-primary bg-primary/10 border-solid"
                    : "border-border hover:border-primary"
            )}
        >
            <CardContent className="flex h-full w-full items-center justify-center p-4">
                <input
                    {...getInputProps()}
                />
                {renderContent()}
            </CardContent>
        </Card>
    );
}