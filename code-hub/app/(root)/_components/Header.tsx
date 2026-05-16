import { currentUser } from "@clerk/nextjs/server";
import { Show } from "@clerk/nextjs";
import { ConvexHttpClient } from "convex/browser";
import { api } from '../../../convex/_generated/api';
import Link from "next/link";
import { Blocks, Code2, Sparkles } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import LanguageSelector from "./LanguageSelector";
import HeaderProfileBtn from "./HeaderProfileBtn";
import RunButton from "./RunButton";

async function Header() {

    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)
    const user = await currentUser();

    const convexUser = await convex.query(api.users.getUser, {
        userId: user?.id || '',
    });

    return (
        <div className="relative z-10">
            <div
                className="flex flex-col lg:flex-row items-center lg:justify-between justify-center bg-[#0a0a0f]/80 backdrop-blur-xl p-4 lg:p-6 mb-4 rounded-lg">
                <div className="flex items-center justify-between w-full lg:w-auto mb-4 lg:mb-0">
                    <Link href="/" className="relative flex items-center gap-3 group">
                        {/* Logo hover effect */}
                        <div className="absolute transition-all duration-500 rounded-lg opacity-0 -inset-2 bg-linear-to-r from-blue-500/20 to-purple-500/20 group-hover:opacity-100 blur-xl" />
                        {/* Logo */}
                        <div className="relative bg-linear-to-br from-[#1a1a2e] to-[#0a0a0f] p-2 rounded-xl ring-1 ring-white/10 group-hover:ring-white/20 transition-all">
                            <Blocks className="text-blue-400 transition-transform duration-500 transform size-6 -rotate-6 group-hover:rotate-0" />
                        </div>

                        <div className="flex flex-col">
                            <span className="block text-lg font-semibold text-transparent bg-linear-to-r from-blue-400 via-blue-300 to-purple-400 bg-clip-text">CodeHub</span>
                            <span className="block text-xs font-medium text-blue-400/60">Interactive Code Editor</span>
                        </div>
                    </Link>
                    {/* Navigation */}
                    <nav className="flex items-center space-x-1">
                        <Link href="/snippets" className="relative group flex items-center gap-2 px-4 py-1.5 rounded-lg text-gray-300 bg-gray-800/50 hover:bg-blue-500/10 border border-gray-800 hover:border-blue-500/50 transition-all duration-300 shadow-lg overflow-hidden">
                            <div className="absolute inset-0 transition-opacity opacity-0 bg-linear-to-r from-blue-500/10 to-purple-500/10 group-hover:opacity-100" />
                            <Code2 className="relative z-10 w-4 h-4 transition-transform group-hover:rotate-3" />
                            <span className="relative z-10 text-sm font-medium transition-colors group-hover:text-white">Snippets</span>
                        </Link>
                    </nav>
                </div>
                <div className="flex items-center justify-center flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <ThemeSelector />
                        <LanguageSelector hasAccess={Boolean(convexUser?.isPro)} />
                    </div>
                    {!convexUser?.isPro && (
                        <Link
                            href="/pricing"
                            className="flex items-center gap-2 px-4 py-1.5 rounded-lg border border-amber-500/20 hover:border-amber-500/40 bg-linear-to-r from-amber-500/1 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 transition-all duration-300">
                            <Sparkles className="w-4 h-4 text-amber-400 hover:text-amber-300" />
                            <span className="text-sm font-medium text-amber-400/90 hover:text-amber-300">Pro</span>
                        </Link>
                    )}
                    <Show when="signed-in">
                        <RunButton />
                    </Show>
                    <div className="pl-3 border-l border-gray-800">
                        <HeaderProfileBtn />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Header;