export function ProfileSkeleton({ editing }: { editing: boolean }) {
    return (
        <div
            role="status"
            aria-live="polite"
            aria-label="Loading profile information"
            className="animate-pulse"
        >
            <header className="flex items-end justify-between gap-4">
                <div>
                    <div className="h-3 w-28 rounded-full bg-[#dfe5dc]" />
                    <div className="mt-3 h-9 w-48 rounded-lg bg-[#e3e8e0]" />
                    <div className="mt-3 h-4 w-72 max-w-[70vw] rounded-full bg-[#e9ede7]" />
                </div>
                <div className="hidden h-11 w-36 rounded-xl bg-[#e3e8e0] sm:block" />
            </header>

            {editing ? (
                <div className="grid gap-5 mt-8">
                    <EditSectionSkeleton includeAvatar />
                    <EditSectionSkeleton />
                </div>
            ) : (
                <div className="mt-8 grid items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
                    <aside className="grid gap-4">
                        <section className="p-6 bg-white border rounded-2xl border-black/6">
                            <div className="mx-auto h-28 w-28 rounded-full bg-[#dce4d9]" />
                            <div className="mx-auto mt-5 h-6 w-40 rounded-md bg-[#dfe5dc]" />
                            <div className="mx-auto mt-3 h-3 w-48 rounded-full bg-[#e9ede7]" />
                            <div className="mx-auto mt-3 h-3 w-32 rounded-full bg-[#e9ede7]" />
                            <div className="pt-5 mt-5 border-t border-black/6">
                                <div className="mx-auto h-8 w-44 rounded-full bg-[#e4ebe1]" />
                            </div>
                        </section>
                        <section className="p-5 bg-white border rounded-2xl border-black/6">
                            <div className="h-4 w-28 rounded bg-[#dfe5dc]" />
                            <div className="grid gap-4 mt-5">
                                {[0, 1, 2, 3].map((item) => (
                                    <div key={item} className="flex justify-between gap-5">
                                        <div className="h-3 w-20 rounded-full bg-[#e9ede7]" />
                                        <div className="h-3 w-14 rounded-full bg-[#dfe5dc]" />
                                    </div>
                                ))}
                            </div>
                        </section>
                    </aside>

                    <main className="grid gap-6">
                        <section className="p-6 bg-white border rounded-2xl border-black/6 sm:p-8">
                            <div className="h-3 w-28 rounded-full bg-[#dfe5dc]" />
                            <div className="mt-4 h-7 w-64 rounded-lg bg-[#dfe5dc]" />
                            <div className="mt-5 h-3 w-full rounded-full bg-[#e9ede7]" />
                            <div className="mt-3 h-3 w-4/5 rounded-full bg-[#e9ede7]" />
                            <div className="grid gap-3 mt-7 sm:grid-cols-3">
                                {[0, 1, 2].map((item) => (
                                    <div key={item} className="h-16 rounded-xl bg-[#f0f3ee]" />
                                ))}
                            </div>
                        </section>
                        <section className="grid gap-4 sm:grid-cols-3">
                            {[0, 1, 2].map((item) => (
                                <div
                                    key={item}
                                    className="h-24 p-5 bg-white border rounded-2xl border-black/6"
                                >
                                    <div className="h-6 w-20 rounded bg-[#dfe5dc]" />
                                    <div className="mt-3 h-3 w-28 rounded-full bg-[#e9ede7]" />
                                </div>
                            ))}
                        </section>
                        <section className="p-6 bg-white border h-72 rounded-2xl border-black/6">
                            <div className="h-5 w-44 rounded bg-[#dfe5dc]" />
                            <div className="mt-3 h-3 w-64 rounded-full bg-[#e9ede7]" />
                            <div className="mt-8 h-28 rounded-xl bg-[#f0f3ee]" />
                        </section>
                    </main>
                </div>
            )}
            <span className="sr-only">Loading profile information</span>
        </div>
    );
};

function EditSectionSkeleton({ includeAvatar = false }: { includeAvatar?: boolean }) {
    return (
        <section className="p-5 bg-white border rounded-2xl border-black/6 sm:p-6">
            <div className="h-5 w-40 rounded-md bg-[#dfe5dc]" />
            <div className="mt-2 h-3 w-72 max-w-full rounded-full bg-[#e9ede7]" />
            {includeAvatar && (
                <div className="mt-5 flex items-center gap-4 rounded-xl bg-[#f4f6f2] p-4">
                    <div className="h-20 w-20 shrink-0 rounded-full bg-[#dce4d9]" />
                    <div className="w-full max-w-sm">
                        <div className="h-4 w-28 rounded bg-[#dfe5dc]" />
                        <div className="mt-2 h-3 w-52 rounded-full bg-[#e5eae2]" />
                        <div className="mt-3 bg-white rounded-lg h-9 w-28" />
                    </div>
                </div>
            )}
            <div className="grid gap-4 mt-5 sm:grid-cols-2">
                {[0, 1, 2, 3].map((item) => (
                    <div key={item}>
                        <div className="h-3 w-20 rounded-full bg-[#dfe5dc]" />
                        <div className="mt-2 h-11 rounded-xl bg-[#f0f3ee]" />
                    </div>
                ))}
            </div>
            {!includeAvatar && <div className="mt-4 h-28 rounded-xl bg-[#f0f3ee]" />}
        </section>
    );
};