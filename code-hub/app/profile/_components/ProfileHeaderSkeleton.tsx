function ProfileHeaderSkeleton() {
    return (
        <div
            className="relative mb-8 bg-gradient-to-br from-[#12121a] to-[#1a1a2e] rounded-2xl p-8 border
       border-gray-800/50 overflow-hidden"
        >
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px]" />
            <div className="relative flex items-center gap-8">
                {/* Avatar Skeleton */}
                <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-600/20 blur-xl" />
                    <div className="relative z-10 w-24 h-24 border-4 rounded-full bg-gray-800/80 animate-pulse border-gray-800/50" />
                    <div
                        className="absolute z-20 w-8 h-8 rounded-full -top-2 -right-2 bg-gradient-to-r from-purple-500/50 to-purple-600/50 animate-pulse"
                    />
                </div>

                {/* User Info Skeleton */}
                <div className="space-y-3">
                    <div className="w-48 h-8 rounded bg-gray-800/80 animate-pulse" />
                    <div className="w-32 h-5 rounded bg-gray-800/80 animate-pulse" />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-4 mt-8 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="relative p-4 overflow-hidden border group rounded-xl bg-gray-800/20 border-gray-800/50"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br opacity-5" />
                        <div className="relative space-y-4">
                            {/* Stat Header */}
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <div className="w-24 h-4 rounded bg-gray-800/80 animate-pulse" />
                                    <div className="w-16 h-8 rounded bg-gray-800/80 animate-pulse" />
                                    <div className="w-32 h-4 rounded bg-gray-800/80 animate-pulse" />
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-gray-800/80 animate-pulse" />
                            </div>

                            {/* Stat Footer */}
                            <div className="flex items-center gap-2 pt-4 border-t border-gray-800/50">
                                <div className="w-4 h-4 rounded bg-gray-800/80 animate-pulse" />
                                <div className="w-20 h-4 rounded bg-gray-800/80 animate-pulse" />
                                <div className="w-16 h-4 rounded bg-gray-800/80 animate-pulse" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ProfileHeaderSkeleton;