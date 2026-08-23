import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prismaConfig from "../../prisma.config";

export const auth = betterAuth({
    database: prismaAdapter(prismaConfig, {
        provider: "postgresql",
    })
});