import { RequestHandler } from "express";
import { ApiResponse } from "../../types/common.types.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { requireFreelancer } from "../freelancer/freelancer.controller.js";
import { getConnectsHistory } from "./connects.service.js";

export const getAvailableConnects: RequestHandler = async (request, response) => {
    requireFreelancer(request);

    const body: ApiResponse<{ connects: number }> = {
        success: true,
        message: 'Available connects retrieved',
        data: {
            connects: request.availableConnects ?? 0
        }
    };

    response.status(200).json(body);
};

export const getLoggedInFreelancerConnectsHistory: RequestHandler = asyncHandler(async (request, response) => {
    const auth = requireFreelancer(request);
    const history = await getConnectsHistory(auth.userId);

    const body: ApiResponse<typeof history> = {
        success: true,
        message: 'Connects history retrieved successfully',
        data: history
    };

    response.status(200).json(body);
});