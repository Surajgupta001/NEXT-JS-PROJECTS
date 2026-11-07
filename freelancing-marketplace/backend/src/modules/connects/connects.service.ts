import { and, desc, eq, gte, sql } from "drizzle-orm";
import { CONNECTS_CACHE_TTL_SECONDS, CONNECTS_PLANS, ConnectsPlan, getConnectsCacheKey, INITIAL_CONNECTS, PROPOSAL_CONNECTS } from "../../config/constants.js";
import { database } from "../../database/client.js";
import { connects, connects_history, connects_purchase_history } from "../../database/schema.js";
import { ApiError } from "../../utils/api-error.js";
import { redis } from "../../config/redis.js";
import { env } from "../../config/env.js";
import { stripe } from "../../config/stripe.js";

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

export const createConnectsCheckout = async (freelancerId: string, purchasedConnects: ConnectsPlan) => {
    if (!env.stripeSecretKey || !env.freelancerDashboard) {
        throw new ApiError(500, 'Connects payment are not configured.');
    };

    const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [
            {
                quantity: 1,
                price_data: {
                    currency: 'usd',
                    unit_amount: CONNECTS_PLANS[purchasedConnects],
                    product_data: {
                        name: `${purchasedConnects} connects`,
                    },
                },
            },
        ],
        metadata: {
            freelancerId,
            purchasedConnects: String(purchasedConnects),
        },
        success_url: `${env.freelancerDashboard}/settings?section=connects&payment=success`,
        cancel_url: `${env.freelancerDashboard}/settings?section=connects`,
    });

    if (!session.url) {
        throw new ApiError(500, 'Failed to create checkout session.');
    }

    return session.url;
};


export const completeConnectsPurchase = async (freelancerId: string, purchasedConnects: ConnectsPlan, paymentId: string) => {
    const balance = await database.transaction(async (tsx) => {
        const [balance] = await tsx.insert(connects_purchase_history).values({
            connects_id: sql`(SELECT ${connects.id} FROM ${connects} WHERE ${connects.freelancer_id} = ${freelancerId})`,
            purchased_connects: purchasedConnects,
            amount_paid: String(CONNECTS_PLANS[purchasedConnects] / 100),
            payment_id: paymentId,
            status: 'COMPLETED',
        }).onConflictDoNothing({
            target: connects_purchase_history.payment_id,
        }).returning();

        if (!balance) return;

        const [updatedBalance] = await tsx.update(connects).set({
            connects: sql`${connects.connects} + ${purchasedConnects}`,
            updated_At: new Date(),
        }).where(eq(connects.freelancer_id, freelancerId)).returning();

        if (!updatedBalance) {
            throw new ApiError(400, "Connects balance not found.");
        }

        await tsx.insert(connects_history).values({
            connects_id: updatedBalance.id,
            type: 'connects purchased',
            description: `Purchased ${purchasedConnects} connects`,
            amount: purchasedConnects,
        });

        return updatedBalance;
    });

    if (balance) {
        await cacheBalance(freelancerId, balance.connects);
    }
};