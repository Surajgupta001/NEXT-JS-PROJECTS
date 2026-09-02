import { cn } from "@/lib/utils";
import { CloudUploadIcon, FileVideoIcon, ImageIcon, XIcon } from "lucide-react";
import { Button } from "../ui/button";
import Image from "next/image";

interface RenderEmptyStateProps {
    isDragActive: boolean;
    fileTypeAccepted?: "image" | "video";
}

export default function RenderEmptyState({ isDragActive, fileTypeAccepted }: RenderEmptyStateProps) {
    const isVideo = fileTypeAccepted === "video";

    return (
        <div className="text-center">
            <div className="flex items-center justify-center mx-auto mb-4 rounded-full size-12 bg-muted">
                {isVideo ? (
                    <FileVideoIcon
                        className={cn(
                            "size-6 text-muted-foreground",
                            isDragActive && "text-primary"
                        )}
                    />
                ) : (
                    <CloudUploadIcon
                        className={cn(
                            "size-6 text-muted-foreground",
                            isDragActive && "text-primary"
                        )}
                    />
                )}
            </div>

            <p className="text-base font-semibold text-foreground">
                Drop your {isVideo ? "video" : "image"} here or{" "}
                <span className="font-bold cursor-pointer text-primary">
                    click to upload
                </span>
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
                {isVideo
                    ? "MP4, WebM, MOV, or AVI (max 50MB)"
                    : "JPG, JPEG, PNG, or WEBP (max 5MB)"}
            </p>

            <Button type="button" className="mt-4 cursor-pointer" >
                Select File
            </Button>
        </div>
    );
}

export function RenderErrorState({ onRetry }: { onRetry?: () => void }) {
    return (
        <div className="text-center">
            <div className="flex items-center justify-center mx-auto mb-4 rounded-full size-12 bg-destructive/30">
                <ImageIcon className="size-6 text-destructive" />
            </div>

            <p className="text-base font-semibold">
                Upload Failed
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
                Something went wrong while uploading the file.
            </p>

            {onRetry && (
                <Button
                    className="mt-4"
                    type="button"
                    variant="outline"
                    onClick={onRetry}
                >
                    Try Again
                </Button>
            )}
        </div>
    );
}

interface RenderUploadedStateProps {
    previewUrl: string;
    isDeleting: boolean;
    handleRemoveFile: () => void;
    fileTypeAccepted?: "image" | "video";
}

export function RenderUploadedState({ previewUrl, isDeleting, handleRemoveFile, fileTypeAccepted }: RenderUploadedStateProps) {
    const isVideo = fileTypeAccepted === "video";

    return (
        <div className="relative w-full h-full">
            {isVideo ? (
                <video
                    src={previewUrl}
                    className="object-contain w-full h-full p-2 rounded-md"
                    controls
                />
            ) : (
                <Image
                    src={previewUrl}
                    alt="Uploaded file preview"
                    fill
                    unoptimized
                    className="object-contain p-2 rounded-md"
                />
            )}

            <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute z-10 right-2 top-2 size-8"
                onClick={(event) => {
                    event.stopPropagation();
                    handleRemoveFile();
                }}
                disabled={isDeleting}
            >
                {isDeleting ? (
                    <div className="border-2 rounded-full size-4 animate-spin border-muted border-t-destructive" />
                ) : (
                    <XIcon className="size-4" />
                )}
            </Button>
        </div>
    );
}

interface RenderUploadingStateProps {
    progress: number;
    file: File;
    previewUrl: string;
    fileTypeAccepted?: "image" | "video";
}

export function RenderUploadingState({ progress, file, previewUrl, fileTypeAccepted }: RenderUploadingStateProps) {
    const isVideo = fileTypeAccepted === "video";

    return (
        <div className="relative w-full h-full">
            {/* Preview */}
            {isVideo ? (
                <video
                    src={previewUrl}
                    className="object-contain w-full h-full p-2 rounded-md opacity-60"
                />
            ) : (
                <Image
                    src={previewUrl}
                    alt="Uploading file preview"
                    fill
                    unoptimized
                    className="object-contain p-2 rounded-md opacity-60"
                />
            )}

            {/* Loading Overlay */}
            <div className="absolute inset-0 flex items-center justify-center rounded-md bg-background/60 backdrop-blur-sm">
                <div className="flex flex-col items-center w-64 gap-3 px-6 py-5 rounded-lg shadow-lg bg-background/95">
                    {/* Spinner */}
                    <div className="border-4 rounded-full size-8 animate-spin border-muted border-t-primary" />

                    <div className="w-full text-center">
                        <p className="text-sm font-semibold">
                            Uploading...
                        </p>

                        <p className="mt-1 text-xs truncate text-muted-foreground">
                            {file.name}
                        </p>

                        <p className="mt-1 text-xs font-medium">
                            {progress}%
                        </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 overflow-hidden rounded-full bg-muted">
                        <div
                            className="h-full transition-all duration-300 bg-primary"
                            style={{
                                width: `${progress}%`,
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}