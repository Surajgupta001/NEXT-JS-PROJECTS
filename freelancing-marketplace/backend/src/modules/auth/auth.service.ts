import { createClerkClient } from "@clerk/backend";
import { env } from "../../config/env.js";
import { ApiError } from "../../utils/api-error.js";
import { database } from "../../database/client.js";
import { accounts } from "../../database/schema.js";
import { redis } from "../../config/redis.js";
import { ACCOUNT_AUTH_CACHE_TTL_SECONDS, getAccountAuthCacheKey } from "../../config/constants.js";

export interface SignupInput {
    userId: string;
    role: 'client' | 'freelancer';
    sessionId?: string;
    accountExists: boolean;
    isOnboarded: boolean;
};

const getDatabaseRole = (role: SignupInput['role']): 'CLIENT' | 'FREELANCER' => {
    return role === 'client' ? 'CLIENT' : 'FREELANCER';
};

export const receiveSignup = async (input: SignupInput): Promise<void> => {
    if (input.accountExists) return;

    const clerk = createClerkClient({ secretKey: env.clerkSecretKey });
    const user = await clerk.users.getUser(input.userId);

    const email = user.primaryEmailAddress?.emailAddress ?? user.emailAddresses.at(0)?.emailAddress;

    if (!email) {
        throw new ApiError(400, 'the authenticated account has no no email address associated with it');
    }

    const now = new Date();

    try {
        await database.insert(accounts).values({
            auth_id: input.userId,
            email,
            role: getDatabaseRole(input.role),
            identityVerified: false,
            isOnBoardingComplete: false,
            created_At: now,
            updated_At: now,
        })
            .onConflictDoNothing({
                target: [accounts.auth_id, accounts.role],
            });
    } catch (error) {
        console.error('Error inserting account into database:', error);
        throw new ApiError(500, 'failed to create account in the database');
    }

    await redis.setEx(
        getAccountAuthCacheKey(input.userId, input.role),
        ACCOUNT_AUTH_CACHE_TTL_SECONDS,
        JSON.stringify({
            userId: input.userId,
            role: input.role,
            accountExists: true,
            isOnboarded: input.isOnboarded,
        })
    )
};