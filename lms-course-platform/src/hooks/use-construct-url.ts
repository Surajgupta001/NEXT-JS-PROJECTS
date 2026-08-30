import { env } from "@/lib/env";

export function useConstructUrl(key: string) {
    if (!key) return "";
    if (key.startsWith("http://") || key.startsWith("https://")) {
        return key;
    }
    const endpoint = env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT.replace(/\/$/, "");
    const cleanKey = key.replace(/^\//, "");
    return `${endpoint}/${cleanKey}`;
}