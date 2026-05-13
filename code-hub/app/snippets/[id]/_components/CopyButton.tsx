"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

function CopyButton({ code }: { code: string }) {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={copyToClipboard}
            type="button"
            className="relative p-2 transition-all duration-200 rounded-lg hover:bg-white/10 group"
        >
            {copied ? (
                <Check className="text-green-400 size-4" />
            ) : (
                <Copy className="text-gray-400 size-4 group-hover:text-gray-300" />
            )}
        </button>
    );
}

export default CopyButton;