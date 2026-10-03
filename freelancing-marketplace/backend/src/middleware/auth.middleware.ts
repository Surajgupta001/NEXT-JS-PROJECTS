import { verifyToken } from '@clerk/backend';
import { RequestHandler } from "express";
import { env } from '../config/env.js';
import { ApiError } from "../utils/api-error.js";
import { asynchandler } from "../utils/async-handler.js";
import { ACCOUNT_AUTH_CACHE_TTL_SECONDS, getAccountAuthCacheKey } from '../config/constants.js';
import { redis } from '../config/redis.js';
import { database } from '../database/client.js';
import { accounts } from '../database/schema.js';
import { and, eq } from 'drizzle-orm';

const accountRoles = ['client', 'freelancer'] as const;

type AccountRole = (typeof accountRoles)[number];

interface cacheAccountAuth {
    userId: string;
    role: 'client' | 'freelancer';
    accountExists: boolean;
    isOnboarded: boolean;
}

const isAccountRole = (value: unknown): value is AccountRole => {
    return typeof value === 'string' && accountRoles.includes(value as AccountRole);
}

const getBearerToken = (authorizationHeader: string | undefined) => {
    
    if (!authorizationHeader?.startsWith('Bearer ')) {
        return null;
    }

    const token = authorizationHeader?.slice('Bearer '.length).trim();
    return token || null;
};

const isAccountAvailable = async (
    requestedRole: 'client' | 'freelancer',
    userId: string
): Promise<cacheAccountAuth> => {
    const cachKey = getAccountAuthCacheKey(userId, requestedRole);
    const cachedvalue = await redis.get(cachKey);

    if (cachedvalue) {
        await redis.expire(cachKey, ACCOUNT_AUTH_CACHE_TTL_SECONDS);
        return JSON.parse(cachedvalue) as cacheAccountAuth;
    }

    const databaseRole = requestedRole === 'client' ? 'CLIENT' : 'FREELANCER';

    const [account] = await database
        .select({
            isOnboardingComplete: accounts.isOnBoardingComplete,
        })
        .from(accounts)
        .where(and(
            eq(accounts.auth_id, userId),
            eq(accounts.role, databaseRole)
        ))
        .limit(1);

    const accountAuth: cacheAccountAuth = {
        userId,
        accountExists: Boolean(account),
        role: requestedRole,
        isOnboarded: account?.isOnboardingComplete === true
    };

    await redis.setEx(
        cachKey,
        ACCOUNT_AUTH_CACHE_TTL_SECONDS,
        JSON.stringify(accountAuth)
    );

    return accountAuth;
}

export const isAuthenticated: RequestHandler = asynchandler(async (request, _response, next) => {
    const token = getBearerToken(request?.headers.authorization);
    const requestedRole = request.body?.role ?? request?.query.role;

    if (!token) {
        throw new ApiError(401, 'Please do login to access this API!');
    }

    if (!isAccountRole(requestedRole)) {
        throw new ApiError(400, 'A valid account role is required.');
    }

    let claim: Awaited<ReturnType<typeof verifyToken>>;

    try {
        claim = await verifyToken(token, {
            secretKey: env.clerkSecretKey
        });
    } catch (error) {
        throw new ApiError(401, 'Authentication token is invalid or expired. Please login again.');
    }

    const accountAuth = await isAccountAvailable(requestedRole, claim.sub);

    request.auth = {
        userId: claim.sub,
        sessionId: typeof claim.sid === 'string' ? claim.sid : undefined,
        role: accountAuth.role,
        accountExists: accountAuth.accountExists,
        isOnboarded: accountAuth.isOnboarded
    },
        next();
});