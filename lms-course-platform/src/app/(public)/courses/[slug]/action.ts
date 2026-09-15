'use server';

import { requireUser } from "@/app/data/user/require-user";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { stripe } from "@/lib/stripe";
import { request } from "@arcjet/next";
import Stripe from "stripe";

const aj = arcjet.withRule(
    fixedWindow({
        mode: "LIVE",
        window: "1m",
        max: 5,
    })
);

export async function enrollInCourseAction(courseId: string) {
    const user = await requireUser();

    try {
        const req = await request();

        const decision = await aj.protect(req, {
            fingerprint: user.id,
        });

        // Check if request IS denied
        if (decision.isDenied()) {
            return {
                status: "error",
                message: "Too many requests. You have been blocked.",
            };
        }

        const course = await prisma.course.findUnique({
            where: {
                id: courseId,
            },
            select: {
                id: true,
                title: true,
                price: true,
                slug: true,
                stripePriceId: true,
            },
        });

        if (!course) {
            return {
                status: "error",
                message: "Course not found.",
            };
        }

        if (!course.stripePriceId) {
            return {
                status: "error",
                message: "Course is not configured for payments. Please contact support.",
            };
        }

        // Get existing Stripe customer
        let stripeCustomerId: string;

        const userWithStripeCustomerId =
            await prisma.user.findUnique({
                where: {
                    id: user.id,
                },
                select: {
                    stripeCustomerId: true,
                },
            });

        if (userWithStripeCustomerId?.stripeCustomerId) {
            stripeCustomerId = userWithStripeCustomerId.stripeCustomerId;
        } else {
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.name,
                metadata: {
                    userId: user.id,
                },
            });

            stripeCustomerId = customer.id;

            await prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    stripeCustomerId,
                },
            });
        }

        const result = await prisma.$transaction(async (tx) => {
            const existingEnrollment =
                await tx.enrollment.findUnique({
                    where: {
                        courseId_userId: {
                            courseId: course.id,
                            userId: user.id,
                        },
                    },
                    select: {
                        id: true,
                        status: true,
                    },
                });

            if (existingEnrollment?.status === "ACTIVE") {
                return {
                    status: "success" as const,
                    message: "You are already enrolled in this course.",
                    checkoutUrl: null,
                };
            }

            let enrollment;

            if (existingEnrollment) {
                enrollment = await tx.enrollment.update({
                    where: {
                        id: existingEnrollment.id,
                    },
                    data: {
                        amount: course.price,
                        status: "PENDING",
                    },
                });
            } else {
                enrollment = await tx.enrollment.create({
                    data: {
                        userId: user.id,
                        courseId: course.id,
                        amount: course.price,
                        status: "PENDING",
                    },
                });
            }

            const checkoutSession =
                await stripe.checkout.sessions.create({
                    customer: stripeCustomerId,
                    line_items: [
                        {
                            price: course.stripePriceId,
                            quantity: 1,
                        },
                    ],
                    mode: "payment",
                    success_url: `${env.BETTER_AUTH_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
                    cancel_url: `${env.BETTER_AUTH_URL}/payment/cancel`,
                    metadata: {
                        userId: user.id,
                        courseId: course.id,
                        enrollmentId: enrollment.id,
                    },
                });

            return {
                status: "success" as const,
                message: "Redirecting to checkout...",
                checkoutUrl: checkoutSession.url,
            };
        });

        if (result.status === "success" && !result.checkoutUrl) {
            return {
                status: "success",
                message: result.message,
                checkoutUrl: null as string | null,
            };
        }

        return {
            status: "success",
            message: result.message,
            checkoutUrl: result.checkoutUrl as string,
        };
    } catch (error) {
        console.error("Error enrolling in course:", error);

        if (error instanceof Stripe.errors.StripeError) {
            return {
                status: "error",
                message: "Payment system error. Please try again later.",
            };
        }

        return {
            status: "error",
            message: "Failed to enroll in course. Please try again later.",
        };
    }
}