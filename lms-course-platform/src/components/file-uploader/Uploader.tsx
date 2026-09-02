"use client";

import { useCallback, useRef, useState } from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import { ImageKitAbortError, ImageKitInvalidRequestError, ImageKitServerError, ImageKitUploadNetworkError, upload } from "@imagekit/next";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { Card, CardContent } from "../ui/card";
import { cn } from "@/lib/utils";
import RenderEmptyState, { RenderErrorState, RenderUploadedState, RenderUploadingState } from "./RenderState";
import { useConstructUrl } from "@/hooks/use-construct-url";

interface UploaderProps {
    value?: string;
    onChange?: (value: string) => void;
    fileTypeAccepted: "image" | "video";
}

const IMAGE_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const VIDEO_MAX_SIZE = 50 * 1024 * 1024; // 50MB

const IMAGE_ACCEPT = {
    "image/*": [".jpeg", ".jpg", ".png", ".webp"],
};

const VIDEO_ACCEPT = {
    "video/*": [".mp4", ".webm", ".mov", ".avi"],
};

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

export default function Uploader({ value, onChange, fileTypeAccepted }: UploaderProps) {
    const fileUrl = useConstructUrl(value || '');
    const isVideo = fileTypeAccepted === "video";

    const [fileState, setFileState] = useState<UploaderState>({
        id: null,
        file: null,
        uploading: false,
        progress: 0,
        key: undefined,
        fileId: undefined,
        url: undefined,
        isDeleting: false,
        error: false,
        fileType: fileTypeAccepted,
        objectUrl: value ? fileUrl : undefined,
    });

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
            });

            if (!authResponse.ok) {
                const errorData = await authResponse.json().catch(() => null);
                throw new Error(errorData?.error || "Failed to authenticate with ImageKit");
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
                folder: isVideo ? "/lms/courses/videos" : "/lms/courses/thumbnails",
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
        [onChange, isVideo]
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
            fileType: fileTypeAccepted,
        });

        uploadFile(file);
    }, [fileState.objectUrl, revokeObjectUrl, uploadFile, fileTypeAccepted]);

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

        const sizeLimit = isVideo ? "50MB" : "5MB";

        if (fileSize) {
            toast.error(`File size exceeds the ${sizeLimit} limit.`);
        }

        if (tooManyFiles) {
            toast.error("You can only upload one file at a time.");
        }

        if (invalidType) {
            if (isVideo) {
                toast.error("Only MP4, WebM, MOV, and AVI videos are allowed.");
            } else {
                toast.error("Only JPG, JPEG, PNG, and WEBP images are allowed.");
            }
        }
    }, [isVideo]);

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
                    fileTypeAccepted={fileTypeAccepted}
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
                    fileTypeAccepted={fileTypeAccepted}
                />
            );
        }

        /*
         * Empty
         */
        return (
            <RenderEmptyState
                isDragActive={isDragActive}
                fileTypeAccepted={fileTypeAccepted}
            />
        );
    }

    const maxSize = isVideo ? VIDEO_MAX_SIZE : IMAGE_MAX_SIZE;

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: isVideo ? VIDEO_ACCEPT : IMAGE_ACCEPT,
        maxFiles: 1,
        maxSize,
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
            <CardContent className="flex items-center justify-center w-full h-full p-4">
                <input
                    {...getInputProps()}
                />
                {renderContent()}
            </CardContent>
        </Card>
    );
}