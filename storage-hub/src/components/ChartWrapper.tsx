"use client";

import dynamic from "next/dynamic";

const Chart = dynamic(() => import("./Chart"), { ssr: false });

export default function ChartWrapper({ used = 0 }: { used: number }) {
    return <Chart used={used} />;
}
