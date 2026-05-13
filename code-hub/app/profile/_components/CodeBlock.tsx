"use client";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";

interface CodeBlockProps {
    code: string;
    language: string;
}

const CodeBlock = ({ code, language }: CodeBlockProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const lines = code.split("\n");
    const displayCode = isExpanded ? code : lines.slice(0, 6).join("\n");

    return (
        <div className="relative">
            <SyntaxHighlighter
                language={language.toLowerCase()}
                style={atomOneDark}
                customStyle={{
                    padding: "1rem",
                    borderRadius: "0.5rem",
                    background: "rgba(0, 0, 0, 0.4)",
                    margin: 0,
                }}
            >
                {displayCode}
            </SyntaxHighlighter>

            {lines.length > 6 && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="absolute flex items-center gap-1 px-2 py-1 text-xs text-blue-400 transition-colors rounded bottom-2 right-2 bg-blue-500/20 hover:bg-blue-500/30"
                >
                    {isExpanded ? (
                        <>
                            Show Less <ChevronUp className="w-3 h-3" />
                        </>
                    ) : (
                        <>
                            Show More <ChevronDown className="w-3 h-3" />
                        </>
                    )}
                </button>
            )}
        </div>
    );
};

export default CodeBlock;