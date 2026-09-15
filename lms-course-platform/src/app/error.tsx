'use client';

import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
            <h1 className="text-4xl font-bold">Something went wrong</h1>
            <p className="text-muted-foreground">Please try again. If the problem persists, contact support.</p>
            <Button onClick={() => reset()}>Try again</Button>
        </div>
    );
}
