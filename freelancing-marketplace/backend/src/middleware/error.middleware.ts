import { ErrorRequestHandler } from "express";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../types/common.types.js";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
    if (!(error instanceof ApiError)) {
        console.error('Unhandled API error:', error);
    }
    const statusCode = error instanceof ApiError ? error.statusCode : 500;
    const message = error instanceof ApiError ? error.message : 'An unexpected error occurred';
    response.status(statusCode).json({
        success: false,
        message
    } satisfies ApiResponse<never>);
};