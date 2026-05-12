import { NextResponse } from "next/server";

const WANDBOX_COMPILER_MAP: Record<string, string> = {
    javascript: "nodejs-20.17.0",
    typescript: "typescript-5.6.2",
    python: "cpython-3.14.0",
    java: "openjdk-jdk-22+36",
    go: "go-1.23.2",
    rust: "rust-1.82.0",
    cpp: "gcc-13.2.0",
    csharp: "mono-6.12.0.199",
    ruby: "ruby-4.0.2",
    swift: "swift-6.0.1"
};

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const language = body.language;
        const code = body.files?.[0]?.content || "";

        const compiler = WANDBOX_COMPILER_MAP[language] || WANDBOX_COMPILER_MAP["javascript"];

        console.log(`Forwarding execution to Wandbox API using compiler: ${compiler}`);

        const response = await fetch("https://wandbox.org/api/compile.json", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                compiler: compiler,
                code: code
            }),
        });

        if (!response.ok) {
            throw new Error(`Wandbox API failed with HTTP ${response.status}`);
        }

        const wandboxData = await response.json();

        // Formatter logic: Remap Wandbox output structure to the internal 
        // Piston response format already expected by the frontend state machine.
        const hasCompileError = Boolean(wandboxData.compiler_error) || 
                                (wandboxData.status && parseInt(wandboxData.status) !== 0 && !wandboxData.program_message);

        const remappedResponse = {
            run: {
                code: parseInt(wandboxData.status) || 0,
                output: wandboxData.program_output || wandboxData.program_message || "",
                stderr: wandboxData.program_error || ""
            },
            compile: {
                code: hasCompileError ? 1 : 0,
                output: wandboxData.compiler_output || wandboxData.compiler_message || "",
                stderr: wandboxData.compiler_error || ""
            }
        };

        return NextResponse.json(remappedResponse);

    } catch (error: any) {
        console.error("Execution Proxy Routing Error:", error);
        return NextResponse.json(
            { 
                message: "Internal Execution Engine Failure", 
                error: error.message 
            }, 
            { status: 500 }
        );
    }
}
