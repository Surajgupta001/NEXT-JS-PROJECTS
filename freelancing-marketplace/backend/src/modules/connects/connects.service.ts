import { and, desc, eq, gte, sql } from "drizzle-orm";
import { CONNECTS_CACHE_TTL_SECONDS, getConnectsCacheKey, INITIAL_CONNECTS, PROPOSAL_CONNECTS } from "../../config/constants.js";
import { database } from "../../database/client.js";
import { connects, connects_history } from "../../database/schema.js";
import { ApiError } from "../../utils/api-error.js";
import { redis } from "../../config/redis.js";

const cacheBalance = (freelancerId: string, balance: number) => {
    return redis.setEx(
        getConnectsCacheKey(freelancerId),
        CONNECTS_CACHE_TTL_SECONDS,
        String(balance)
    );
};

export const addConnects = async (freelancerId: string) => {
    const balance = await database.transaction(async (tsx) => {
        const [balance] = await tsx.insert(connects).values({
            freelancer_id: freelancerId,
            connects: INITIAL_CONNECTS,
        }).onConflictDoNothing({
            target: connects.freelancer_id,
        }).returning();

        if (!balance) return;

        await tsx.insert(connects_history).values({
            connects_id: balance.id,
            type: 'onboarding Bonus',
            description: "New account welcome connects",
            amount: INITIAL_CONNECTS,
        });

        return balance;
    });

    if (balance) {
        await cacheBalance(freelancerId, balance.connects);
    }
    return balance;
};

export const chargeConnects = async (freelancerId: string, description: string) => {
    const balance = await database.transaction(async (tsx) => {
        const [balance] = await tsx.update(connects).set({
            connects: sql`${connects.connects} - ${PROPOSAL_CONNECTS}`,
        }).where(and(
            eq(connects.freelancer_id, freelancerId), gte(connects.connects, PROPOSAL_CONNECTS))
        ).returning();

        if (!balance) {
            throw new ApiError(400, "Insufficient connects to submit a proposal.");
        }

        await tsx.insert(connects_history).values({
            connects_id: balance.id,
            type: 'proposal submitted',
            description,
            amount: -PROPOSAL_CONNECTS,
        });

        return balance;
    });

    await cacheBalance(freelancerId, balance.connects);
    return balance;
};

export const returnConnects = async (freelancerId: string, description: string) => {
    const balance = await database.transaction(async (tsx) => {
        const [balance] = await tsx.update(connects).set({
            connects: sql`${connects.connects} + ${PROPOSAL_CONNECTS}`,
            updated_At: new Date(),
        }).where(eq(connects.freelancer_id, freelancerId)).returning();

        if (!balance) {
            throw new ApiError(400, "Freelancer not found.");
        }

        await tsx.insert(connects_history).values({
            connects_id: balance.id,
            type: 'proposal withdrawn refund',
            description,
            amount: PROPOSAL_CONNECTS,
        });
        return balance;
    });

    await cacheBalance(freelancerId, balance.connects);
    return balance;
};

export const getConnectsHistory = async (freelancerId: string) => {
    return database
        .select({
            id: connects_history.id,
            type: connects_history.type,
            description: connects_history.description,
            amount: connects_history.amount,
            created_At: connects_history.created_At,
        })
        .from(connects_history)
        .innerJoin(connects, eq(connects_history.connects_id, connects.id))
        .where(eq(connects.freelancer_id, freelancerId))
        .orderBy(desc(connects_history.created_At))
        .limit(10);
};