import { PrismaClient } from "@/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const globalPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

function createPrismaClient() {
    const adapter = new PrismaPg({
        connectionString: process.env.DATABASE_URL!,
    });

    return new PrismaClient({
        adapter,
    });
}

export const db = globalPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalPrisma.prisma = db;
}