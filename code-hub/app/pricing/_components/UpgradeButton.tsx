"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import Script from "next/script";

// Define highly precise types for window and LemonSqueezy library object
declare global {
    interface Window {
        createLemonSqueezy?: () => void;
        LemonSqueezy?: {
            Setup: (options: {
                eventHandler: (event: { event: string; data?: any }) => void;
            }) => void;
            Refresh: () => void;
            Url: {
                Open: (url: string) => void;
            };
        };
    }
}

function UpgradeButton() {
    const CHECKOUT_URL = process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL!;
    const [scriptLoaded, setScriptLoaded] = useState(false);

    const setupLemonSqueezy = () => {
        if (window.LemonSqueezy) {
            // Register event handler to catch payment success
            window.LemonSqueezy.Setup({
                eventHandler: (event) => {
                    if (event.event === "Checkout.Success") {
                        // Perform a clean browser redirect upon payment completion
                        window.location.href = "/";
                    }
                },
            });
            // Bind class selectors and listeners
            window.LemonSqueezy.Refresh();
            setScriptLoaded(true);
        }
    };

    useEffect(() => {
        // Fallback check if script had loaded from previous mount/navigations
        if (window.LemonSqueezy) {
            setupLemonSqueezy();
        }
    }, []);

    const handleUpgradeClick = (e: React.MouseEvent) => {
        e.preventDefault();

        // Attach embed query so LemonSqueezy renders as modal
        const embedCheckoutUrl = `${CHECKOUT_URL}${CHECKOUT_URL.includes("?") ? "&" : "?"}embed=1`;

        if (window.LemonSqueezy) {
            // Guarantee dynamic callback initialization right before launch
            window.LemonSqueezy.Setup({
                eventHandler: (event) => {
                    if (event.event === "Checkout.Success") {
                        window.location.href = "/";
                    }
                },
            });
            
            // Programmatically force open checkout overlay modal
            window.LemonSqueezy.Url.Open(embedCheckoutUrl);
        } else {
            // Fallback: standard browser navigation if script fails to load
            window.location.href = embedCheckoutUrl;
        }
    };

    return (
        <>
            <Script
                src="https://app.lemonsqueezy.com/js/lemon.js"
                strategy="afterInteractive"
                onReady={setupLemonSqueezy}
            />
            <button
                onClick={handleUpgradeClick}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-white transition-all rounded-lg bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 cursor-pointer"
            >
                <Zap className="w-5 h-5" />
                Upgrade to Pro
            </button>
        </>
    );
}

export default UpgradeButton;