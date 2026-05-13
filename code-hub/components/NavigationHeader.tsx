import HeaderProfileBtn from "@/app/(root)/_components/HeaderProfileBtn";
import { Show } from "@clerk/nextjs";
import { Blocks, Code2, Sparkles } from "lucide-react";
import Link from "next/link";

function NavigationHeader() {
    return (
        <div className="sticky top-0 z-50 w-full border-b border-gray-800/50 bg-gray-950/80 backdrop-blur-xl backdrop-saturate-150">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5" />
            <div className="px-4 mx-auto max-w-7xl">
                <div className="relative flex items-center justify-between h-16">
                    <div className="flex items-center gap-8">
                        {/* Logo */}
                        <Link href="/" className="relative flex items-center gap-3 group">
                            {/* logo hover effect */}
                            <div
                                className="absolute transition-all duration-500 rounded-lg opacity-0 -inset-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 group-hover:opacity-100 blur-xl"
                            />

                            {/* Logo */}
                            <div className="relative bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0f] p-2 rounded-xl ring-1 ring-white/10 group-hover:ring-white/20 transition-all">
                                <Blocks className="w-6 h-6 text-blue-400 transition-transform duration-500 transform -rotate-6 group-hover:rotate-0" />
                            </div>

                            <div className="relative">
                                <span
                                    className="block text-lg font-semibold text-transparent bg-gradient-to-r from-blue-400 via-blue-300 to-purple-400 bg-clip-text"
                                >
                                    CodeCraft
                                </span>
                                <span className="block text-xs font-medium text-blue-400/60">
                                    Interactive Code Editor
                                </span>
                            </div>
                        </Link>

                        {/* snippets Link */}
                        <Link
                            href="/snippets"
                            className="relative group flex items-center gap-2 px-4 py-1.5 rounded-lg text-gray-300 bg-gray-800/50 hover:bg-blue-500/10 
                  border border-gray-800 hover:border-blue-500/50 transition-all duration-300 shadow-lg overflow-hidden"
                        >
                            <div
                                className="absolute inset-0 transition-opacity opacity-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 group-hover:opacity-100"
                            />
                            <Code2 className="relative z-10 w-4 h-4 transition-transform group-hover:rotate-3" />
                            <span className="relative z-10 text-sm font-medium transition-colors group-hover:text-white">
                                Snippets
                            </span>
                        </Link>
                    </div>

                    {/* right rection */}
                    <div className="flex items-center gap-4">
                        <Show when="signed-out">
                            <Link
                                href="/pricing"
                                className="flex items-center gap-2 px-4 py-1.5 rounded-lg border border-amber-500/20
                     hover:border-amber-500/40 bg-gradient-to-r from-amber-500/10 
                    to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 transition-all 
                    duration-300"
                            >
                                <Sparkles className="w-4 h-4 text-amber-400 hover:text-amber-300" />
                                <span className="text-sm font-medium text-amber-400/90 hover:text-amber-300">
                                    Pro
                                </span>
                            </Link>
                        </Show>

                        {/* profile button */}
                        <HeaderProfileBtn />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NavigationHeader