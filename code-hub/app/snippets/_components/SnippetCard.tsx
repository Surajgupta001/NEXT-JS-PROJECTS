"use client";
import { Snippet } from "@/types";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Clock, Trash2, User } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import StarButton from "@/components/StarButton";

function SnippetCard({ snippet }: { snippet: Snippet }) {

    const { user } = useUser();
    const deleteSnippet = useMutation(api.snippets.deleteSnippet);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);

        try {
            await deleteSnippet({ snippetId: snippet._id });
        } catch (error) {
            console.log("Error deleting snippet:", error);
            toast.error("Error deleting snippet");
        } finally {
            setIsDeleting(false);
        }
    };
    return (
        <motion.div
            layout
            className="relative group"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
        >
            <Link href={`/snippets/${snippet._id}`} className="block h-full">
                <div
                    className="relative h-full bg-[#1e1e2e]/80 backdrop-blur-sm rounded-xl 
              border border-[#313244]/50 hover:border-[#313244] 
              transition-all duration-300 overflow-hidden"
                >
                    <div className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div
                                        className="absolute inset-0 transition-all duration-500 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 blur opacity-20 group-hover:opacity-30"
                                        area-hidden="true"
                                    />
                                    <div
                                        className="relative p-2 transition-all duration-500 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 group-hover:from-blue-500/20 group-hover:to-purple-500/20"
                                    >
                                        <Image
                                            src={`/${snippet.language}.svg`}
                                            alt={`${snippet.language} logo`}
                                            className="relative z-10 object-contain w-6 h-6"
                                            width={24}
                                            height={24}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <span className="px-3 py-1 text-xs font-medium text-blue-400 rounded-lg bg-blue-500/10">
                                        {snippet.language}
                                    </span>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Clock className="size-3" />
                                        {new Date(snippet._creationTime).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                            <div
                                className="absolute z-10 flex items-center gap-4 top-5 right-5"
                                onClick={(e) => e.preventDefault()}
                            >
                                <StarButton snippetId={snippet._id} />

                                {user?.id === snippet.userId && (
                                    <div className="z-10" onClick={(e) => e.preventDefault()}>
                                        <button
                                            onClick={handleDelete}
                                            disabled={isDeleting}
                                            className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200
                                      ${isDeleting
                                                    ? "bg-red-500/20 text-red-400 cursor-not-allowed"
                                                    : "bg-gray-500/10 text-gray-400 hover:bg-red-500/10 hover:text-red-400"
                                                }
                                    `}
                                        >
                                            {isDeleting ? (
                                                <div className="size-3.5 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                                            ) : (
                                                <Trash2 className="size-3.5" />
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="space-y-4">
                            <div>
                                <h2 className="mb-2 text-xl font-semibold text-white transition-colors line-clamp-1 group-hover:text-blue-400">
                                    {snippet.title}
                                </h2>
                                <div className="flex items-center gap-3 text-sm text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1 rounded-md bg-gray-800/50">
                                            <User className="size-3" />
                                        </div>
                                        <span className="truncate max-w-[150px]">{snippet.userName}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="relative group/code">
                                <div className="absolute inset-0 transition-all rounded-lg opacity-0 bg-gradient-to-br from-blue-500/15 to-purple-500/5 group-hover/code:opacity-100" />
                                <pre className="relative p-4 overflow-hidden font-mono text-sm text-gray-300 rounded-lg bg-black/30 line-clamp-3">
                                    {snippet.code}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

export default SnippetCard