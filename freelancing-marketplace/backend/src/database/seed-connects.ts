import "dotenv/config";
import { and, eq } from "drizzle-orm";
import { CONNECTS_CACHE_TTL_SECONDS, getConnectsCacheKey } from "../config/constants.js";
import { connectRedis, disconnectRedis, redis } from "../config/redis.js";
import { database } from "./client.js";
import {
    connects,
    connects_history,
    connects_purchase_history,
    freelancer_metadata,
} from "./schema.js";

const seedConnects = async () => {
    await connectRedis();

    const freelancers = await database
        .select({ authId: freelancer_metadata.auth_id })
        .from(freelancer_metadata);

    for (const freelancer of freelancers) {
        await database
            .insert(connects)
            .values({ freelancer_id: freelancer.authId, connects: 60 })
            .onConflictDoUpdate({
                target: connects.freelancer_id,
                set: { connects: 60, updated_At: new Date() },
            });

        const [balance] = await database
            .select({ id: connects.id })
            .from(connects)
            .where(eq(connects.freelancer_id, freelancer.authId))
            .limit(1);

        if (!balance) continue;

        await redis.setEx(
            getConnectsCacheKey(freelancer.authId),
            CONNECTS_CACHE_TTL_SECONDS,
            "60",
        );

        const [seedHistory] = await database
            .select({ id: connects_history.id })
            .from(connects_history)
            .where(and(
                eq(connects_history.connects_id, balance.id),
                eq(connects_history.type, "dev seed"),
            ))
            .limit(1);

        if (!seedHistory) {
            await database.insert(connects_history).values([
                {
                    connects_id: balance.id,
                    type: "dev seed",
                    description: "Test balance for frontend development",
                    amount: 60,
                },
                {
                    connects_id: balance.id,
                    type: "proposal submitted",
                    description: "Test proposal charge",
                    amount: -6,
                },
                {
                    connects_id: balance.id,
                    type: "proposal withdrawn refund",
                    description: "Test proposal refund",
                    amount: 6,
                },
            ]);
        }

        await database
            .insert(connects_purchase_history)
            .values({
                connects_id: balance.id,
                purchased_connects: 40,
                amount_paid: "6.00",
                payment_id: `dev-seed-connects-${freelancer.authId}`,
                status: "COMPLETED",
            })
            .onConflictDoNothing({
                target: connects_purchase_history.payment_id,
            });
    }

    console.log(`Seeded connects data for ${freelancers.length} freelancer(s).`);
    await disconnectRedis();
};

seedConnects().catch((error) => {
    console.error("Failed to seed connects data:", error);
    process.exitCode = 1;
});
