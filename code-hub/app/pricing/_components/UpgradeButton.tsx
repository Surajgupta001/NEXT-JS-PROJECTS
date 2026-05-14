import { Zap } from "lucide-react";
import Link from "next/link";

function UpgradeButton() {

    const CHECKOUT_URL = process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL!

    return (
        <Link
            href={CHECKOUT_URL}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-white transition-all rounded-lg bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
        >
            <Zap className="w-5 h-5" />
            Upgrade to Pro
        </Link>
    )
}

export default UpgradeButton