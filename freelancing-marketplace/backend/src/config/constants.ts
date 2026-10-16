import { ApiError } from "../utils/api-error.js";

export const API_PREFIX = '/api/v1';
export const SERVICE_NAME = 'freelancing-marketplace';

export const ACCOUNT_AUTH_CACHE_TTL_SECONDS = 10 * 60;
export const getAccountAuthCacheKey = (
    userId: string,
    role: 'client' | 'freelancer'
): string => {
    return `account-auth:${userId}:${role}`;
};

export const requiredText = (value: string | undefined, fileName: string): string => {
    if (typeof value !== "string" || !value.trim()) {
        throw new ApiError(400, `${fileName} is required and must be a non-empty string.`);
    }

    return value.trim();
};

export const requireWebsite = (value: string | undefined): string => {
    const website = requiredText(value, 'Company website');

    try {
        const url = new URL(website);
        if (!['http:', 'https:'].includes(url.protocol)) {
            throw new Error();
        }
    } catch {
        throw new ApiError(400, 'Company website must be a valid URL.');
    }

    return website;
};