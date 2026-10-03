export const API_PREFIX = '/api/v1';
export const SERVICE_NAME = 'freelancing-marketplace';

export const ACCOUNT_AUTH_CACHE_TTL_SECONDS = 10 * 60;
export const getAccountAuthCacheKey = (
    userId: string,
    role: 'client' | 'freelancer'
): string => {
    return `account-auth:${userId}:${role}`;
};