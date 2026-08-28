import 'server-only';

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";
import { env } from "./env";
import { emailOTP } from 'better-auth/plugins'
import { resend } from "./resend";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    socialProviders: {
        github: {
            clientId: env.AUTH_GITHUB_CLIENT_ID,
            clientSecret: env.AUTH_GITHUB_CLIENT_SECRET_ID,
        },
    },

    plugins: [
        emailOTP({
            async sendVerificationOTP({ email, otp }) {
                await resend.emails.send({
                    from: 'LMS <onboarding@resend.dev>',
                    to: [email],
                    subject: 'LMS - Your One-Time Password (OTP)',
                    html: `<p>Your One-Time Password (OTP) is: <strong>${otp}</strong></p>`,
                });

            },
        }),
    ]
});