"use client";

import { useCallback, useRef, useState } from "react";
import {
    FileRejection,
    useDropzone,
} from "react-dropzone";
import {
    ImageKitAbortError,
    ImageKitInvalidRequestError,
    ImageKitServerError,
    ImageKitUploadNetworkError,
    upload,
} from "@imagekit/next";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

import { Card, CardContent } from "../ui/card";
import { cn } from "@/lib/utils";

import RenderEmptyState, {
    RenderErrorState,
    RenderUploadedState,
    RenderUploadingState,
} from "./RenderState";

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

export default function Uploader() {
    const [fileState, setFileState] =
        useState<UploaderState>(initialState);

    /*
     * Keep the currently selected file in a ref.
     * This avoids stale state inside callbacks.
     */
    const fileRef = useRef<File | null>(null);

    /*
     * Revoke a local blob URL safely.
     */
    function revokeObjectUrl(url?: string) {
        if (url?.startsWith("blob:")) {
            URL.revokeObjectURL(url);
        }
    }

    /*
     * Upload file to ImageKit.
     */
    async function uploadFile(file: File) {
        setFileState((prevState) => ({
            ...prevState,
            uploading: true,
            progress: 0,
            error: false,
        }));

        try {
            /*
             * STEP 1
             * Get ImageKit authentication parameters.
             */
            const authResponse = await fetch(
                "/api/imagekit/upload",
                {
                    method: "GET",
                }
            );

            if (!authResponse.ok) {
                throw new Error(
                    "Failed to authenticate with ImageKit"
                );
            }

            const {
                token,
                expire,
                signature,
                publicKey,
            } = await authResponse.json();

            /*
             * STEP 2
             * Upload directly to ImageKit.
             */
            const result = await upload({
                file,
                fileName: file.name,

                token,
                expire,
                signature,
                publicKey,

                folder:
                    "/lms/courses/thumbnails",

                useUniqueFileName: true,

                onProgress: (event) => {
                    if (!event.total) {
                        return;
                    }

                    const progress = Math.round(
                        (event.loaded / event.total) *
                        100
                    );

                    setFileState((prevState) => ({
                        ...prevState,
                        progress,
                    }));
                },
            });

            /*
             * STEP 3
             * Upload completed.
             */
            setFileState((prevState) => ({
                ...prevState,
                uploading: false,
                progress: 100,

                // ImageKit file path
                key: result.filePath,

                // ImageKit file ID
                fileId: result.fileId,

                // ImageKit URL
                url: result.url,

                error: false,
            }));

            toast.success(
                "File uploaded successfully!"
            );

            console.log(
                "ImageKit upload response:",
                result
            );
        } catch (error) {
            console.error(
                "ImageKit upload error:",
                error
            );

            if (
                error instanceof
                ImageKitAbortError
            ) {
                toast.error(
                    `Upload aborted: ${error.reason}`
                );
            } else if (
                error instanceof
                ImageKitInvalidRequestError
            ) {
                toast.error(
                    `Invalid upload request: ${error.message}`
                );
            } else if (
                error instanceof
                ImageKitUploadNetworkError
            ) {
                toast.error(
                    `Network error: ${error.message}`
                );
            } else if (
                error instanceof
                ImageKitServerError
            ) {
                toast.error(
                    `ImageKit server error: ${error.message}`
                );
            } else {
                toast.error(
                    "Failed to upload file."
                );
            }

            setFileState((prevState) => ({
                ...prevState,
                uploading: false,
                progress: 0,
                error: true,
            }));
        }
    }

    /*
     * Handle dropped file.
     */
    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            if (acceptedFiles.length === 0) {
                return;
            }

            const file = acceptedFiles[0];

            /*
             * Remove previous local preview.
             */
            revokeObjectUrl(
                fileState.objectUrl
            );

            /*
             * Create local preview immediately.
             */
            const objectUrl =
                URL.createObjectURL(file);

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
        },
        [fileState.objectUrl]
    );

    /*
     * Remove uploaded file from ImageKit.
     */
    async function handleRemoveFile() {
        if (
            fileState.isDeleting ||
            !fileState.fileId
        ) {
            return;
        }

        try {
            setFileState((prevState) => ({
                ...prevState,
                isDeleting: true,
            }));

            /*
             * Send ImageKit fileId,
             * NOT the local blob URL.
             */
            const response = await fetch(
                "/api/imagekit/delete",
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        fileId:
                            fileState.fileId,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to delete file from ImageKit"
                );
            }

            /*
             * Remove local preview.
             */
            revokeObjectUrl(
                fileState.objectUrl
            );

            fileRef.current = null;

            /*
             * Reset uploader.
             */
            setFileState({
                ...initialState,
            });

            toast.success(
                "File removed successfully!"
            );
        } catch (error) {
            console.error(
                "Error removing file:",
                error
            );

            setFileState((prevState) => ({
                ...prevState,
                isDeleting: false,
            }));

            toast.error(
                "Failed to remove file."
            );
        }
    }

    /*
     * Retry failed upload.
     */
    function handleRetry() {
        if (!fileRef.current) {
            return;
        }

        setFileState((prevState) => ({
            ...prevState,
            error: false,
            uploading: true,
            progress: 0,
        }));

        uploadFile(fileRef.current);
    }

    /*
     * Handle rejected files.
     */
    function rejectedFiles(
        fileRejections: FileRejection[]
    ) {
        if (fileRejections.length === 0) {
            return;
        }

        const tooManyFiles =
            fileRejections.find(
                (rejection) =>
                    rejection.errors.some(
                        (error) =>
                            error.code ===
                            "too-many-files"
                    )
            );

        const fileSize =
            fileRejections.find(
                (rejection) =>
                    rejection.errors.some(
                        (error) =>
                            error.code ===
                            "file-too-large"
                    )
            );

        const invalidType =
            fileRejections.find(
                (rejection) =>
                    rejection.errors.some(
                        (error) =>
                            error.code ===
                            "file-invalid-type"
                    )
            );

        if (fileSize) {
            toast.error(
                "File size exceeds the 5MB limit."
            );
        }

        if (tooManyFiles) {
            toast.error(
                "You can only upload one file at a time."
            );
        }

        if (invalidType) {
            toast.error(
                "Only JPG, JPEG, PNG, and WEBP images are allowed."
            );
        }
    }

    /*
     * Decide which UI state to render.
     */
    function renderContent() {
        /*
         * Uploading
         */
        if (fileState.uploading) {
            if (
                !fileState.file ||
                !fileState.objectUrl
            ) {
                return null;
            }

            return (
                <RenderUploadingState
                    progress={
                        fileState.progress
                    }
                    file={fileState.file}
                    previewUrl={
                        fileState.objectUrl
                    }
                />
            );
        }

        /*
         * Error
         */
        if (fileState.error) {
            return (
                <RenderErrorState
                    onRetry={handleRetry}
                />
            );
        }

        /*
         * Uploaded
         */
        if (fileState.objectUrl) {
            return (
                <RenderUploadedState
                    previewUrl={
                        fileState.objectUrl
                    }
                    isDeleting={
                        fileState.isDeleting
                    }
                    handleRemoveFile={
                        handleRemoveFile
                    }
                />
            );
        }

        /*
         * Empty
         */
        return (
            <RenderEmptyState
                isDragActive={
                    isDragActive
                }
            />
        );
    }

    const {
        getRootProps,
        getInputProps,
        isDragActive,
    } = useDropzone({
        onDrop,

        accept: {
            "image/*": [
                ".jpeg",
                ".jpg",
                ".png",
                ".webp",
            ],
        },

        maxFiles: 1,

        maxSize:
            5 * 1024 * 1024,

        multiple: false,

        onDropRejected:
            rejectedFiles,
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