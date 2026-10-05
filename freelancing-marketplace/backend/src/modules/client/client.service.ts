import { database } from "../../database/client.js";
import { accounts, client_metadata } from "../../database/schema.js";
import { eq, and } from "drizzle-orm";
import { ApiError } from "../../utils/api-error.js";
import { redis } from "../../config/redis.js";
import { ACCOUNT_AUTH_CACHE_TTL_SECONDS, getAccountAuthCacheKey } from "../../config/constants.js";

export interface SaveClientProfileInput {
    userId: string;
    professionalRole: string;
    companyName: string;
    companyWebsite: string;
    companySize: string;
    industry: string;
    companyDescription: string;
};

export interface ClientMetadataData {
    professionalRole: string;
    companyName: string;
    companyWebsite: string;
    companySize: string;
    industry: string;
    companyDescription: string;
    joinedAt: Date | null;
    identifyVerified: boolean;
    paymentMethodVerified: boolean;
};

export interface ClientProfileData extends ClientMetadataData {
    isOnboarded: boolean;
};

export const getClientProfile = async (userId: string): Promise<ClientMetadataData | null> => {
    const [profile] = await database.select({
        professionalRole: client_metadata.role,
        companyName: client_metadata.company_name,
        companyWebsite: client_metadata.company_website,
        companySize: client_metadata.company_size,
        industry: client_metadata.industry,
        companyDescription: client_metadata.company_description,
        joinedAt: client_metadata.created_At,
        identifyVerified: accounts.identityVerified,
        paymentMethodVerified: accounts.paymentMethodVerified,
    })
        .from(client_metadata)
        .innerJoin(accounts, and(eq(accounts.auth_id, client_metadata.auth_id), eq(accounts.role, 'CLIENT')))
        .where(eq(client_metadata.auth_id, userId))
        .limit(1);

    if (!profile) {
        return null;
    }

    return {
        ...profile,
        identifyVerified: profile.identifyVerified === true,
        paymentMethodVerified: profile.paymentMethodVerified === true,
    };
};

export const SaveClientProfile = async (input: SaveClientProfileInput): Promise<ClientProfileData> => {
    const now = new Date();

    const profile: any = await database.transaction(async (tsx) => {
        const [account] = await tsx.update(accounts).set({
            isOnBoardingComplete: true,
            updated_At: now,
        })
            .where(and(
                eq(accounts.auth_id, input.userId), eq(accounts.role, 'CLIENT'))
            )
            .returning({
                id: accounts.id,
                identifyVerified: accounts.identityVerified,
                paymentMethodVerified: accounts.paymentMethodVerified,
            })

        if (!account) {
            throw new ApiError(404, 'Client account not found');
        }

        const [savedProfile] = await tsx.insert(client_metadata).values({
            auth_id: input.userId,
            role: input.professionalRole,
            company_name: input.companyName,
            company_website: input.companyWebsite,
            company_size: input.companySize,
            industry: input.industry,
            company_description: input.companyDescription,
            created_At: now,
            updated_At: now,
        })
            .onConflictDoUpdate({
                target: client_metadata.auth_id,
                set: {
                    role: input.professionalRole,
                    company_name: input.companyName,
                    company_website: input.companyWebsite,
                    company_size: input.companySize,
                    industry: input.industry,
                    company_description: input.companyDescription,
                    updated_At: now,
                },
            }).returning({
                professionalRole: client_metadata.role,
                companyName: client_metadata.company_name,
                companyWebsite: client_metadata.company_website,
                companySize: client_metadata.company_size,
                industry: client_metadata.industry,
                companyDescription: client_metadata.company_description,
                joinedAt: client_metadata?.created_At,
            });

        if (!savedProfile) {
            throw new ApiError(500, 'Failed to save client profile');
        }

        return {
            ...savedProfile,
            identityVerified: account.identifyVerified === true,
            paymentMethodVerified: account.paymentMethodVerified === true,
        };
    });

    await redis.setEx(
        getAccountAuthCacheKey(input.userId, 'client'),
        ACCOUNT_AUTH_CACHE_TTL_SECONDS,
        JSON.stringify({
            userId: input.userId,
            accountExists: true,
            role: 'client',
            isOnboarded: true
        }),
    );

    return {
        ...profile,
        isOnboarded: true,
    }
};