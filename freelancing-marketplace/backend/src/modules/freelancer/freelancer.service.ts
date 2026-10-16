import { and, eq } from "drizzle-orm";
import { database } from "../../database/client.js";
import { accounts, freelancer_metadata, freelancer_portfolios } from "../../database/schema.js";
import { FreeLancerProfileData, PortfolioData, SaveFreelancerProfileInput } from "./@types.js";
import { env } from "../../config/env.js";
import { ApiError } from "../../utils/api-error.js";
import { imagekit } from '../../config/imagekit.js';
import { randomUUID } from "node:crypto";
import { redis } from "../../config/redis.js";
import { ACCOUNT_AUTH_CACHE_TTL_SECONDS, getAccountAuthCacheKey } from "../../config/constants.js";

export const getFreelancerProfile = async (userId: string): Promise<FreeLancerProfileData | null> => {
    const [result] = await database
        .select()
        .from(freelancer_metadata)
        .innerJoin(
            accounts,
            and(
                eq(freelancer_metadata.auth_id, accounts.auth_id),
                eq(accounts.role, 'FREELANCER'),
            ),
        )
        .where(eq(freelancer_metadata.auth_id, userId)).limit(1);

    if (!result) {
        return null;
    }

    const profile = result.freelancer_metadata;

    const portfolios = await database
        .select()
        .from(freelancer_portfolios)
        .where(eq(freelancer_portfolios.freelancer_id, result.accounts.id));

    return {
        professional_title: profile.professional_title,
        professional_description: profile.professional_description,
        hourly_rate: Number(profile.hourly_rate),
        country: profile.country,
        city: profile.city,
        availability_status: profile.availability_status,
        weekly_availability: profile.weekly_availability,
        experience_level: profile.experience_level,
        skills: profile.skills,
        languages: profile.languages,
        portfolios,
        identityVerified: result.accounts.identityVerified === true,
        joined_At: profile.created_At,
    }
};

const uploadPortfolioImages = async (userId: string, portfolios: PortfolioData[]) => {
    if (!env.imagekitPrivateKey) {
        throw new ApiError(500, 'ImageKit private key is not configured. Please check the server configuration.');
    }

    const uploadedFileIds: string[] = [];
    const uploadedPortfolios: PortfolioData[] = [];

    try {
        for (const portfolio of portfolios) {
            if (!portfolio.cover_image.url.startsWith('data:image/')) {
                uploadedPortfolios.push(portfolio);
                continue;
            }

            const upload = await imagekit.files.upload({
                file: portfolio.cover_image.url,
                fileName: `portfolio_${randomUUID()}`,
                folder: `/freelancers/${userId}/portfolios/`
            });

            if (!upload.fileId || !upload.url) {
                throw new ApiError(500, 'Failed to upload portfolio cover image. Please try again later.');
            }

            uploadedFileIds.push(upload.fileId);
            uploadedPortfolios.push({
                ...portfolio,
                cover_image: {
                    imageId: upload.fileId,
                    url: upload.url
                }
            });
        }

        return {
            uploadedPortfolios,
            uploadedFileIds
        };
    } catch (error) {
        uploadedFileIds.map((fileId) => imagekit.files.delete(fileId));
        throw error;
    }
};

export const saveFreelancerProfile = async (input: SaveFreelancerProfileInput): Promise<FreeLancerProfileData> => {
    const existingImages = await database.select({
        cover_image: freelancer_portfolios.cover_image
    })
        .from(freelancer_portfolios)
    .innerJoin(
        freelancer_metadata,
        eq(freelancer_portfolios.freelancer_id, freelancer_metadata.id)
    )
    .where(eq(freelancer_metadata.auth_id, input.userId));

    const { uploadedPortfolios, uploadedFileIds } = await uploadPortfolioImages(input.userId, input.portfolios)

    let profile: FreeLancerProfileData;

    try {
        profile = await database.transaction(async (txs) => {
            const [account] = await txs.update(accounts).set({
                isOnBoardingComplete: true,
            }).where(and(
                eq(accounts.auth_id, input.userId),
                eq(accounts.role, 'FREELANCER'),
            )).returning();

            if (!account) {
                throw new ApiError(404, 'Freelance Account not found');
            }

            const metadataValues = {
                professional_title: input.professional_title,
                professional_description: input.professional_description,
                hourly_rate: input.hourly_rate,
                country: input.country,
                city: input.city,
                availability_status: input.availability_status,
                weekly_availability: input.weekly_availability,
                experience_level: input.experience_level,
                skills: input.skills,
                languages: input.languages,
            };

            const [metadata] = await txs.insert(freelancer_metadata).values({
                auth_id: input.userId,
                ...metadataValues,
            }).onConflictDoUpdate({
                target: freelancer_metadata.auth_id,
                set: metadataValues,
            }).returning();

            if (!metadata) {
                throw new ApiError(500, 'Failed to save freelancer profile. Please try again later.');
            }

            await txs
                .delete(freelancer_portfolios)
                .where(eq(freelancer_portfolios.freelancer_id, metadata.id));

            const portfoliosToInsert = await txs.insert(freelancer_portfolios).values(
                uploadedPortfolios.map((portfolio) => ({
                    freelancer_id: metadata.id,
                    ...portfolio,
                })),
            ).returning();

            return {
                professional_title: metadata.professional_title,
                professional_description: metadata.professional_description,
                hourly_rate: Number(metadata.hourly_rate),
                country: metadata.country,
                city: metadata.city,
                availability_status: metadata.availability_status,
                weekly_availability: metadata.weekly_availability,
                experience_level: metadata.experience_level,
                skills: metadata.skills,
                languages: metadata.languages,
                portfolios: portfoliosToInsert,
                identityVerified: account.identityVerified === true,
                joined_At: metadata.created_At,
            };
        });

    } catch (error) {
        await Promise.allSettled(
            uploadedFileIds.map((fileId) => imagekit.files.delete(fileId))
        );
        throw error;
    }

    const retainedImageIds = new Set(
        uploadedPortfolios.map(({ cover_image }) => cover_image.imageId)
    )

    await Promise.allSettled(
        existingImages
        .map(({ cover_image }) => cover_image.imageId)
        .filter((filterId) => filterId && !retainedImageIds.has(filterId))
        .map((filedId) => imagekit.files.delete(filedId))
    );

    await redis.setEx(
        getAccountAuthCacheKey(input.userId, 'freelancer'),
        ACCOUNT_AUTH_CACHE_TTL_SECONDS,
        JSON.stringify({
            userId: input.userId,
            role: 'FREELANCER',
            isOnBoardingComplete: true,
            accountExists: true,
        }),
    );

    return profile;
};