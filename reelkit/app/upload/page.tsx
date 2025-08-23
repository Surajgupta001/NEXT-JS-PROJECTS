"use client";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import FileUpload from "../components/fileUpload";
import { apiClient, VideoFormData } from "@/lib/api_client";
import Image from "next/image";

export default function UploadPage() {
    const { status } = useSession();
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [videoUrl, setVideoUrl] = useState<string>("");
    const [thumbnailUrl, setThumbnailUrl] = useState<string>("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    React.useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
    }, [status, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description || !videoUrl || !thumbnailUrl) {
            setError("Please complete all fields including upload.");
            return;
        }
        setError(null);
        setBusy(true);
        try {
            const payload: VideoFormData = {
                title,
                description,
                videoUrl,
                thumbnailUrl,
                controls: true,
                transformation: { width: 1080, height: 1920, quality: 90 },
            };
            await apiClient.createVideo(payload);
            router.push("/");
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to save video";
            setError(msg);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="flex items-center justify-center w-full min-h-screen px-4 bg-gray-50 dark:bg-neutral-900">
            <div className="w-full max-w-2xl p-6 bg-white shadow-lg dark:bg-neutral-800 rounded-xl sm:p-8">
                <h1 className="mb-6 text-2xl font-semibold text-center text-gray-900 dark:text-white">Upload Video</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-neutral-500 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <textarea
                        className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-neutral-500 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Description"
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    <div>
                        <p className="mb-2 text-sm text-gray-700 dark:text-gray-200">Video</p>
                        <FileUpload
                            fileType="video"
                            onSuccess={(res: unknown) => {
                                const url = (res as { url?: string })?.url ?? "";
                                setVideoUrl(url);
                            }}
                        />
                        {videoUrl && (
                            <div className="mt-3">
                                <p className="mb-2 text-xs font-medium text-gray-600 dark:text-gray-300">Video preview</p>
                                <div className="w-full overflow-hidden bg-black rounded-lg aspect-video">
                                    <video
                                        src={videoUrl}
                                        controls
                                        className="object-contain w-full h-full"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <p className="mb-2 text-sm text-gray-700 dark:text-gray-200">Thumbnail (optional)</p>
                        <FileUpload
                            fileType="image"
                            onSuccess={(res: unknown) => {
                                const url = (res as { url?: string })?.url ?? "";
                                setThumbnailUrl(url);
                            }}
                        />
                        {thumbnailUrl && (
                            <div className="mt-3">
                                <p className="mb-2 text-xs font-medium text-gray-600 dark:text-gray-300">Thumbnail preview</p>
                                <div className="w-full max-w-md overflow-hidden border border-gray-200 rounded-lg dark:border-neutral-800">
                                    <Image
                                        src={thumbnailUrl}
                                        alt="Thumbnail preview"
                                        width={640}
                                        height={360}
                                        className="object-cover w-full h-auto"
                                        sizes="(max-width: 768px) 100vw, 640px"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
                    )}

                    <button
                        type="submit"
                        disabled={busy}
                        className="w-full inline-flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                    >
                        {busy ? "Saving..." : "Save"}
                    </button>
                </form>
            </div>
        </div>
    );
}
