import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { Plan } from "../../types/plan";
import { db } from "./prisma";
import { PLANS } from "./constants";

const getCurrentPlan = async (userId: string): Promise<Plan> => {
    try {
        const client = await clerkClient();
        const subscription = await client.billing.getUserBillingSubscription(userId);

        const activeItem = subscription.subscriptionItems?.find(
            (item: any) => item.status === "active"
        );

        if (activeItem) {
            const slug = activeItem.plan?.slug;
            if (slug === "pro" || slug === "starter") {
                return slug as Plan;
            }
        }
    } catch (error: any) {
        // If the user has no subscription, Clerk's Backend API throws a 404/Not Found error, which is expected
        const status = error.status || error.statusCode;
        const msg = error.message || "";
        if (status !== 404 && !msg.toLowerCase().includes("not found")) {
            console.error("Error fetching billing subscription:", error);
        }
    }
    return "free";
};

export const checkUser = async () => {
    const clerkUser = await currentUser();

    if (!clerkUser) {
        return null;
    }

    try {
        const currentPlan = await getCurrentPlan(clerkUser.id);

        const existing = await db.user.findUnique({
            where: {
                clerkId: clerkUser.id,
            }
        });

        if (existing) {
            // Plan changed - top up to new plan's credits allocation
            // Does not reset existing credits, just adds the new plan's credits to the existing balance

            if (existing.plan !== currentPlan) {
                return await db.user.update({
                    where: {
                        clerkId: clerkUser.id,
                    },
                    data: {
                        plan: currentPlan,
                        credits: existing.credits + PLANS[currentPlan].credits,
                    }
                })
            }

            return existing;
        }

        // New user - create a new record with the current plan's credits allocation
        return await db.user.create({
            data: {
                clerkId: clerkUser.id,
                name: `${clerkUser.firstName ?? 'User'} ${clerkUser.lastName ?? ''}`.trim(),
                email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
                imageUrl: clerkUser.imageUrl ?? '',
                credits: PLANS[currentPlan].credits,
                plan: currentPlan,
            }
        })
    } catch (error) {
        console.error("Error checking user:", error);
        return null;
    }
};