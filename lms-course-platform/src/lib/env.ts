import { createEnv } from "@t3-oss/env-nextjs";
import * as z from "zod";

export const env = createEnv({
    server: {
        DATABASE_URL: z.url(),
        BETTER_AUTH_SECRET: z.string().min(1),
        BETTER_AUTH_URL: z.string().url(),
        AUTH_GITHUB_CLIENT_ID: z.string().min(1),
        AUTH_GITHUB_CLIENT_SECRET_ID: z.string().min(1),
        RESEND_API_KEY: z.string().min(1),
        ARCJET_KEY: z.string().min(1),
        ARCJET_ENV: z.enum(["development", "production"]),
        IMAGEKIT_PRIVATE_KEY: z.string().min(1),
    },

    client: {
        NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY: z.string().min(1),
        NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT: z.string(),
    },

    // For Next.js >= 13.4.4, you only need to destructure client variables:
    experimental__runtimeEnv: {
        NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
        NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
    }
});