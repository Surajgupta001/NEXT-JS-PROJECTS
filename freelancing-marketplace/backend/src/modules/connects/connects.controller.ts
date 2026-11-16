import { RequestHandler } from "express";
import { ApiResponse } from "../../types/common.types.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { requireFreelancer } from "../freelancer/freelancer.controller.js";
import { completeConnectsPurchase, confirmConnectsCheckout, createConnectsCheckout, getConnectsHistory } from "./connects.service.js";
import { CONNECTS_PLANS, ConnectsPlan } from "../../config/constants.js";
import { ApiError } from "../../utils/api-error.js";
import { env } from "../../config/env.js";
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
    response.status(200).json({
        success: true,
        message: 'Checkout session created successfully',
        data: {
            url,
        },
    } satisfies ApiResponse<{ url: string }>);
});

export const completeConnectsCheckout: RequestHandler = asyncHandler(async (request, response) => {
    const auth = requireFreelancer(request);
    const sessionId = request.query.session_id;

    if (typeof sessionId !== 'string' || !sessionId.trim()) {
        throw new ApiError(400, 'Checkout session id is required to confirm the connects purchase.');
    }

    const balance = await confirmConnectsCheckout(auth.userId, sessionId.trim());

    const body: ApiResponse<{ connects: number }> = {
        success: true,
        message: 'Connects purchase confirmed successfully',
        data: {
            connects: balance.connects
        }
    };

    response.status(200).json(body);
});

export const connectsWebhook: RequestHandler = asyncHandler(async (request, response) => {
    const signature = request.headers['stripe-signature'];

    if (!env.stripeWebhookSecret || typeof signature !== 'string') {
        request.logger.error({
            message: 'Stripe webhook secret is not configured or signature is missing.',
            eventName: 'stripe.webhook.validation_failed',
            attributes: {
                service: 'connects-controller',
            },
        });
        throw new ApiError(400, 'Invalid webhook request.');
    }

    const event = stripe.webhooks.constructEvent(request.body, signature, env.stripeWebhookSecret);

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const purchasedConnects = Number(session.metadata?.purchasedConnects) as ConnectsPlan;
        const freelancerId = session.metadata?.freelancerId;

        if (session.payment_status === 'paid' && freelancerId && purchasedConnects in CONNECTS_PLANS) {
            await completeConnectsPurchase(freelancerId, purchasedConnects, session.id);
            request.logger.info({
                message: `${purchasedConnects} Connects purchase completed successfully for ${freelancerId}!`,
                eventName: 'connects.purchase.completed',
            });
        }
    }

    response.status(200).json({ received: true });
});