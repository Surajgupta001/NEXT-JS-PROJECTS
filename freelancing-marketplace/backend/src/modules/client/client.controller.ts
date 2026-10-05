import { RequestHandler } from "express";
import { asynchandler } from "../../utils/async-handler.js";
import { ApiError } from "../../utils/api-error.js";
import { ClientMetadataData, ClientProfileData, getClientProfile, SaveClientProfile, SaveClientProfileInput, } from "./client.service.js";
import { ApiResponse } from "../../types/common.types.js";

export const getLoggedInClientProfile: RequestHandler = asynchandler(async (request, response) => {

    if (!request.auth) {
        throw new ApiError(401, 'Authentication required');
    }

    if (request.auth.role !== 'client') {
        throw new ApiError(403, 'Access denied. Only clients can access this endpoint.');
    }

    const profile = await getClientProfile(request.auth.userId);
    const responseBody: ApiResponse<ClientMetadataData | null> = {
        success: true,
        message: profile ? 'Client profile retrieved successfully' : 'Client profile has not been completed yet.',
        data: profile
    };

    response.status(200).json(responseBody);
});

interface ClientProfileBody {
    professionalRole?: string;
    companyName?: string;
    companyWebsite?: string | undefined;
    companySize?: string;
    industry?: string;
    companyDescription?: string;
};

const requiredText = (value: string | undefined, fileName: string): string => {
    if (typeof value !== "string" || !value.trim()) {
        throw new ApiError(400, `${fileName} is required and must be a non-empty string.`);
    }

    return value.trim();
};

const requireWebsite = (value: string | undefined): string => {
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

export const upsertClientProfile: RequestHandler = asynchandler(async (request, response) => {
    if (!request.auth) {
        throw new ApiError(401, 'Authentication required');
    }

    if (request.auth.role !== 'client') {
        throw new ApiError(403, 'Access denied. Only clients can access this endpoint.');
    }

    const body = request.body as ClientProfileBody;
    const input: SaveClientProfileInput = {
        userId: request.auth.userId,
        professionalRole: requiredText(body.professionalRole, 'Professional role'),
        companyName: requiredText(body.companyName, 'Company name'),
        companyWebsite: requireWebsite(body.companyWebsite),
        companySize: requiredText(body.companySize, 'Company size'),
        industry: requiredText(body.industry, 'Industry'),
        companyDescription: requiredText(body.companyDescription, 'Company description'),
    };

    const profile = await SaveClientProfile(input);
    const responseBody: ApiResponse<ClientProfileData> = {
        success: true,
        message: 'Client profile saved successfully',
        data: profile
    };

    response.status(200).json(responseBody);
});