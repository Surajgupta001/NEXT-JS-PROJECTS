import { currentUser } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import ProPlanView from "./_components/ProPlanView";
import NavigationHeader from "@/components/NavigationHeader";
import { ENTERPRISE_FEATURES, FEATURES } from "./_constants";
import { Star } from "lucide-react";
import FeatureCategory from "./_components/FeatureCategory";
import FeatureItem from "./_components/FeatureItem";
import UpgradeButton from "./_components/UpgradeButton";
import LoginButton from "@/components/LoginButton";

async function PricingPage() {
    const user = await currentUser();
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    const convexUser = await convex.query(api.users.getUser, {
        userId: user?.id || "",
    });

    if (convexUser?.isPro) return <ProPlanView />;

    return (
        <div
            className="relative min-h-screen bg-[#0a0a0f] selection:bg-blue-500/20
     selection:text-blue-200"
        >
            <NavigationHeader />

            {/* main content */}

            <main className="relative px-4 pt-32 pb-24">
                <div className="mx-auto max-w-7xl">
                    {/* Hero   */}
                    <div className="mb-24 text-center">
                        <div className="relative inline-block">
                            <div className="absolute -inset-px bg-linear-to-r from-blue-500 to-purple-500 blur-xl opacity-10" />
                            <h1
                                className="relative mb-8 text-5xl font-semibold text-transparent md:text-6xl lg:text-7xl bg-linear-to-r from-gray-100 to-gray-300 bg-clip-text"
                            >
                                Elevate Your <br />
                                Development Experience
                            </h1>
                        </div>
                        <p className="max-w-3xl mx-auto text-xl text-gray-400">
                            Join the next generation of developers with our professional suite of tools
                        </p>
                    </div>

                    {/* Enterprise Features */}
                    <div className="grid gap-6 mb-24 md:grid-cols-2 lg:grid-cols-4">
                        {ENTERPRISE_FEATURES.map((feature) => (
                            <div
                                key={feature.label}
                                className="group relative bg-linear-to-b from-[#12121a] to-[#0a0a0f] rounded-2xl p-6 hover:transform hover:scale-[1.02] transition-all duration-300"
                            >
                                <div className="relative">
                                    <div
                                        className="flex items-center justify-center w-12 h-12 mb-4 rounded-xl bg-linear-to-br from-blue-500/10 to-purple-500/10 ring-1 ring-gray-800/60 group-hover:ring-blue-500/20"
                                    >
                                        <feature.icon className="w-6 h-6 text-blue-400" />
                                    </div>

                                    <h3 className="mb-2 text-lg font-medium text-white">{feature.label}</h3>
                                    <p className="text-gray-400">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pricing Card */}

                    <div className="relative max-w-4xl mx-auto">
                        <div
                            className="absolute -inset-px bg-linear-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-10"
                        />
                        <div className="relative bg-[#12121a]/90 backdrop-blur-xl rounded-2xl">
                            <div
                                className="absolute inset-x-0 h-px -top-px bg-linear-to-r from-transparent via-blue-500/50 to-transparent"
                            />
                            <div className="absolute inset-x-0 h-px -bottom-px bg-linear-to-r from-transparent via-purple-500/50 to-transparent" />

                            <div className="relative p-8 md:p-12">
                                {/* header */}
                                <div className="mb-12 text-center">
                                    <div className="inline-flex p-3 mb-6 rounded-xl bg-linear-to-br from-blue-500/10 to-purple-500/10 ring-1 ring-gray-800/60">
                                        <Star className="w-8 h-8 text-blue-400" />
                                    </div>
                                    <h2 className="mb-4 text-3xl font-semibold text-white">Lifetime Pro Access</h2>
                                    <div className="flex items-baseline justify-center gap-2 mb-4">
                                        <span className="text-2xl text-gray-400">$</span>
                                        <span className="text-6xl font-semibold text-transparent bg-linear-to-r from-gray-100 to-gray-300 bg-clip-text">
                                            50
                                        </span>
                                        <span className="text-xl text-gray-400">one-time</span>
                                    </div>
                                    <p className="text-lg text-gray-400">Unlock the full potential of CodeCraft</p>
                                </div>

                                {/* Features grid */}
                                <div className="grid gap-12 mb-12 md:grid-cols-3">
                                    <FeatureCategory label="Development">
                                        {FEATURES.development.map((feature, idx) => (
                                            <FeatureItem key={idx}>{feature}</FeatureItem>
                                        ))}
                                    </FeatureCategory>

                                    <FeatureCategory label="Collaboration">
                                        {FEATURES.collaboration.map((feature, idx) => (
                                            <FeatureItem key={idx}>{feature}</FeatureItem>
                                        ))}
                                    </FeatureCategory>

                                    <FeatureCategory label="Deployment">
                                        {FEATURES.deployment.map((feature, idx) => (
                                            <FeatureItem key={idx}>{feature}</FeatureItem>
                                        ))}
                                    </FeatureCategory>
                                </div>

                                {/* CTA */}
                                <div className="flex justify-center">
                                    {user ? <UpgradeButton /> : <LoginButton />}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
export default PricingPage;