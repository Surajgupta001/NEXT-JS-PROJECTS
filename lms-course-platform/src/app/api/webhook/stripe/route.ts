import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { headers } from "next/headers";
import Stripe from "stripe";

export async function POST(req: Request) {
    const body = await req.text();

    const headerList = await headers();

    const signature = headerList.get("stripe-signature") as string;

    if (!signature) {
        return new Response(`Webhook Error: Missing stripe-signature header`, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = Stripe.webhooks.constructEvent(
            body,
            signature,
            env.STRIPE_WEBHOOK_SECRET,
        );
    } catch (error) {
        return new Response(`Webhook Error: ${error}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === "checkout.session.completed") {
        const courseId = session.metadata?.courseId;
        const enrollmentId = session.metadata?.enrollmentId;
        const metadataUserId = session.metadata?.userId;
        const customerId = session.customer as string;

        if (!courseId || !enrollmentId) {
            return new Response(`Webhook Error: Missing courseId or enrollmentId in session metadata.`, { status: 400 });
        }

        // Prefer metadata userId, fall back to Stripe customer lookup
        let userId = metadataUserId;

        if (!userId && customerId) {
            const user = await prisma.user.findUnique({
                where: {
                    stripeCustomerId: customerId,
                },
                select: { id: true },
            });

            userId = user?.id;
        }

        if (!userId) {
            return new Response(`Webhook Error: Could not resolve user for checkout session.`, { status: 404 });
        }

        await prisma.enrollment.upsert({
            where: {
                id: enrollmentId,
            },
            update: {
                userId: userId,
                courseId: courseId,
                amount: session.amount_total ?? undefined,
                status: "ACTIVE",
            },
            create: {
                id: enrollmentId,
                userId: userId,
                courseId: courseId,
                amount: session.amount_total ?? 0,
                status: "ACTIVE",
            },
        });
    }

    return new Response(null, { status: 200 });
}