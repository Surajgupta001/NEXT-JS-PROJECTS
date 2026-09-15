'use server';

import { requireUser } from "@/app/data/user/require-user";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";

/**
 * Fallback activation in case Stripe webhook didn't run yet
 * (e.g. local dev without `stripe listen --forward-to ...`).
 * Verifies the Checkout Session with Stripe, then flips enrollment to ACTIVE.
 */
export async function verifyPaymentAndActivate(sessionId: string) {
    const user = await requireUser();

    if (!sessionId) {
        return { status: "error", message: "Missing session id." };
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status !== "paid") {
            return { status: "pending", message: "Payment not completed yet." };
        }

        const courseId = session.metadata?.courseId;
        const enrollmentId = session.metadata?.enrollmentId;
        const metadataUserId = session.metadata?.userId;

        if (!courseId || !enrollmentId) {
            return { status: "error", message: "Invalid session metadata." };
        }

        // Security: only the owner (or customer owner) can activate
        if (metadataUserId && metadataUserId !== user.id) {
            return { status: "error", message: "Session does not belong to this user." };
        }

        await prisma.enrollment.upsert({
            where: { id: enrollmentId },
            update: {
                userId: user.id,
                courseId,
                amount: session.amount_total ?? undefined,
                status: "ACTIVE",
            },
            create: {
                id: enrollmentId,
                userId: user.id,
                courseId,
                amount: session.amount_total ?? 0,
                status: "ACTIVE",
            },
        });

        return { status: "success", message: "Enrollment activated.", courseId };
    } catch (error) {
        console.error("verifyPaymentAndActivate error:", error);
        return { status: "error", message: "Could not verify payment. Webhook will complete enrollment shortly." };
    }
}
