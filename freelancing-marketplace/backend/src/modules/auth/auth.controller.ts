import { RequestHandler } from "express";
import { ApiError } from "../../utils/api-error.js";
import { ApiResponse } from "../../types/common.types.js";
import { asynchandler } from "../../utils/async-handler.js";
import { receiveSignup } from "./auth.service.js";

interface AuthStatusData {
    role: 'client' | 'freelancer';
    accountExists: boolean;
    isOnboarded: boolean;
}

export const getAuthStatus: RequestHandler = async (request, response) => {
    if (!request.auth) {
        throw new ApiError(401, 'Authentication required');
    }

    const body: ApiResponse<AuthStatusData> = {
        success: true,
        message: 'Authentication status retrieved successfully',
        data: {
            role: request.auth.role,
            accountExists: request.auth.accountExists,
            isOnboarded: request.auth.isOnboarded
        }
    };

    response.status(200).json(body);
};

export const signUp: RequestHandler = asynchandler(async (request, response) => {
    if (!request.auth) {
        throw new ApiError(401, 'Authentication required');
    }

    await receiveSignup(request.auth);

    const body: ApiResponse<never> = {
        success: true,
        message: 'Signup process completed successfully',
    };

    response.status(200).json(body);
});