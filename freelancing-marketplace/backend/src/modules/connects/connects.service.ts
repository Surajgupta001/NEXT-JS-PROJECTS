import { and, desc, eq, gte, sql } from "drizzle-orm";
import { CONNECTS_CACHE_TTL_SECONDS, CONNECTS_PLANS, ConnectsPlan, getConnectsCacheKey, INITIAL_CONNECTS, PROPOSAL_CONNECTS } from "../../config/constants.js";
import { database } from "../../database/client.js";
import { accounts, connects, connects_history, connects_purchase_history } from "../../database/schema.js";
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

type ConnectsTransaction = Parameters<Parameters<typeof database.transaction>[0]>[0];

const createConnectsBalance = async (tsx: ConnectsTransaction, freelancerId: string) => {
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
};

export const addConnects = async (freelancerId: string) => {
    const balance = await database.transaction(async (tsx) => {
        return await createConnectsBalance(tsx, freelancerId);
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
            updated_At: new Date(),
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

    const [account] = await database.select().from(accounts).where(eq(accounts.auth_id, freelancerId)).limit(1);
    if (!account) {
        throw new ApiError(404, 'Freelancer account not found.');
    }

    let customerId = account.stripe_customer_id;

    if (!customerId) {
        const customer = await stripe.customers.create({
            email: account.email,
            metadata: {
                freelancerId,
            },
        });
        customerId = customer.id;

        await database.update(accounts).set({
            stripe_customer_id: customerId,
            updated_At: new Date(),
        }).where(eq(accounts.auth_id, freelancerId));
    }

    const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        customer: customerId,
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
        success_url: `${env.freelancerDashboard}/settings?section=connects&payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${env.freelancerDashboard}/settings?section=connects`,
    });

    if (!session.url) {
        throw new ApiError(500, 'Failed to create checkout session.');
    }

    return session.url;
};


export const completeConnectsPurchase = async (freelancerId: string, purchasedConnects: ConnectsPlan, paymentId: string) => {
    const balance = await database.transaction(async (tsx) => {
        await createConnectsBalance(tsx, freelancerId);

        const [currentBalance] = await tsx
            .select()
            .from(connects)
            .where(eq(connects.freelancer_id, freelancerId))
            .limit(1);

        if (!currentBalance) {
            throw new ApiError(400, "Connects balance not found.");
        }

        const [purchase] = await tsx.insert(connects_purchase_history).values({
            connects_id: currentBalance.id,
            purchased_connects: purchasedConnects,
            amount_paid: String(CONNECTS_PLANS[purchasedConnects] / 100),
            payment_id: paymentId,
            status: 'COMPLETED',
        }).onConflictDoNothing({
            target: connects_purchase_history.payment_id,
        }).returning();

        if (!purchase) return;

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

export const confirmConnectsCheckout = async (freelancerId: string, sessionId: string) => {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const sessionFreelancerId = session.metadata?.freelancerId;
    const purchasedConnects = Number(session.metadata?.purchasedConnects) as ConnectsPlan;

    if (sessionFreelancerId !== freelancerId) {
        throw new ApiError(403, "This checkout session does not belong to the current freelancer.");
    }

    if (session.payment_status !== "paid") {
        throw new ApiError(400, "The connects payment has not been completed.");
    }

    if (!(purchasedConnects in CONNECTS_PLANS)) {
        throw new ApiError(400, "The checkout session contains an invalid connects plan.");
    }

    await completeConnectsPurchase(freelancerId, purchasedConnects, session.id);

    const [balance] = await database
        .select({ connects: connects.connects })
        .from(connects)
        .where(eq(connects.freelancer_id, freelancerId))
        .limit(1);

    if (!balance) {
        throw new ApiError(400, "Connects balance not found.");
    }

    await cacheBalance(freelancerId, balance.connects);
    return balance;
};