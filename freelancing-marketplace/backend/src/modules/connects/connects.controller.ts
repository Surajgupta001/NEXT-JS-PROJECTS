import { RequestHandler } from "express";
import { ApiResponse } from "../../types/common.types.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { requireFreelancer } from "../freelancer/freelancer.controller.js";
import { completeConnectsPurchase, createConnectsCheckout, getConnectsHistory } from "./connects.service.js";
import { CONNECTS_PLANS, ConnectsPlan } from "../../config/constants.js";
import { ApiError } from "../../utils/api-error.js";
import { env } from "node:process";
import { stripe } from "../../config/stripe.js";

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

export const buyConnects: RequestHandler = asyncHandler(async (request, response) => {
    const auth = requireFreelancer(request);
    const purchaseConnects = Number(request.body?.connects) as ConnectsPlan;

    if (!(purchaseConnects in CONNECTS_PLANS)) {
        throw new ApiError(400, 'Select a valid connects plan to purchase.');
    }

    const url = await createConnectsCheckout(auth.userId, purchaseConnects);
    const body: ApiResponse<{ url: string }> = {
        success: true,
        message: 'Checkout session created.',
        data: { url },
    };

    response.status(200).json(body);
});

export const connectsWebhook: RequestHandler = asyncHandler(async (request, response) => {
    const signature = request.headers['stripe-signature'];

    if (!env.stripeWebhookSecret || typeof signature !== 'string') {
        request.logger.error({
            message: 'Stripe webhook secret is not configured or signature is missing.',
        })
        throw new ApiError(400, 'Invalid webhook request.');
    }

    const event = stripe.webhooks.constructEvent(request.body, signature, env.stripeWebhookSecret);

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const purchasedConnects = Number(session.metadata?.purchasedConnects) as ConnectsPlan;
        const freelancerId = session.metadata?.freelancerId;

        if (session.payment_status === 'paid' && freelancerId && purchasedConnects in CONNECTS_PLANS) {
            await completeConnectsPurchase(freelancerId, purchasedConnects, session.id);
        }
    }

    response.status(200).json({ received: true });
});