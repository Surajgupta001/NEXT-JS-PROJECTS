import { RequestHandler } from "express";
import { ApiError } from "../../utils/api-error.js";
import { asynchandler } from "../../utils/async-handler.js";
import { ApiResponse } from "../../types/common.types.js";
import { FreeLancerProfileData, SaveFreelancerProfileInput } from "./@types.js";
import { requiredText } from "../../config/constants.js";
import { getFreelancerProfile, saveFreelancerProfile } from "./freelancer.service.js";

const requireFreelancer = (request: Parameters<RequestHandler>[0]) => {
    if (!request.auth) {
        throw new ApiError(401, 'Authentication is required');
    }

    if (request.auth.role !== 'freelancer') {
        throw new ApiError(403, 'Access denied. Only freelancers is allowed to access this endpoint.');
    }

    return request.auth;
};

export const getLoggedInFreelancerProfile: RequestHandler = asynchandler(async (request, response) => {
    const auth = requireFreelancer(request);
    const profile = await getFreelancerProfile(auth.userId);
    const body: ApiResponse<FreeLancerProfileData | null> = {
        success: true,
        message: profile ? 'Freelancer profile retrieved successfully' : 'Freelancer profile has not been completed yet.',
        data: profile
    };
    response.status(200).json(body);
});

export const upsertFreelancerProfile: RequestHandler = asynchandler(async (request, response) => {
    const auth = requireFreelancer(request);
    const metadata = request.body?.freelancer_metadata as | Record<string, any> | undefined;
    const portfolios = request.body?.freelancer_portfolios as any;

    if (!metadata) {
        throw new ApiError(400, 'Missing freelancer metadata in the request body.');
    };

    if (!Array.isArray(portfolios) || portfolios.length < 1) {
        throw new ApiError(400, 'At least one portfolio is required to complete the freelancer profile.');
    };

    const hourlyRate = Number(metadata.hourly_rate);
    if (!Number.isFinite(hourlyRate) || hourlyRate < 5 || hourlyRate > 1000) {
        throw new ApiError(400, 'Invalid hourly rate. It must be a number between 5 and 1000.');
    }

    const skills = metadata.skills;
    if (!Array.isArray(skills) || skills.length < 3 || skills.length > 15 || skills.some((skill) => typeof skill !== 'string' || !skill.trim() || skill.length > 20)) {
        throw new ApiError(400, 'Invalid skills. They must be an array of strings with a length between 3 and 15, and each string must be between 1 and 20 characters long.');
    }

    const languages = metadata.languages;
    if (!Array.isArray(languages) || languages.length < 1 || languages.length > 5) {
        throw new ApiError(400, 'Invalid languages. They must be in between 1 and 5 languages.');
    }

    const input: SaveFreelancerProfileInput = {
        userId: auth.userId,
        professional_title: requiredText(metadata.professional_title, 'professional title'),
        professional_description: requiredText(metadata.professional_description, 'professional description'),
        hourly_rate: hourlyRate.toString(),
        country: requiredText(metadata.country, 'country'),
        city: requiredText(metadata.city, 'city'),
        availability_status: requiredText(metadata.availability_status, 'availability status'),
        weekly_availability: requiredText(metadata.weekly_availability, 'weekly availability'),
        experience_level: requiredText(metadata.experience_level, 'experience level'),
        skills: skills.map((skill: string) => skill.trim()),
        languages: languages.map((item) => {
            const language = item as Record<string, any>;
            return {
                language: requiredText(language.language, 'language'),
                proficiency: requiredText(language.proficiency, 'Language proficiency')
            };
        }),
        portfolios: portfolios.map((item) => {
            const portfolio = item as Record<string, any>;
            const coverImage = portfolio.cover_image as Record<string, string> | undefined;

            if (!coverImage) {
                throw new ApiError(400, 'Missing cover image for portfolio.');
            }

            const imageId = typeof coverImage.imageId === 'string' ? coverImage.imageId : '';

            const imageUrl = requiredText(coverImage.url, 'Portfolio cover image url');

            if (!imageId && !imageUrl.startsWith('data:image/')) {
                throw new ApiError(400, 'Invalid cover image. Either imageId must be provided or a valid base64 image url must be provided.');
            }

            return {
                title: requiredText(portfolio.title, 'portfolio title'),
                category: requiredText(portfolio.category, 'portfolio category'),
                description: requiredText(portfolio.description, 'portfolio description'),
                live_url: typeof portfolio.live_url === 'string' && portfolio.live_url.trim() ? portfolio.live_url.trim() : null,
                cover_image: {
                    imageId: imageId,
                    url: imageUrl
                }
            }
        }),
    };

    const profile = await saveFreelancerProfile(input);
    const body: ApiResponse<FreeLancerProfileData> = {
        success: true,
        message: 'Freelancer profile saved successfully',
        data: profile
    };
    response.status(200).json(body);
});