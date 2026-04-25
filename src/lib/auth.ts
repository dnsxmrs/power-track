import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { admin } from 'better-auth/plugins/admin';
import { bearer } from 'better-auth/plugins/bearer';
import { twoFactor } from 'better-auth/plugins/two-factor';
import { prisma } from './prisma';

const hasGoogleOAuth =
    typeof process.env.GOOGLE_CLIENT_ID === 'string' &&
    process.env.GOOGLE_CLIENT_ID.length > 0 &&
    typeof process.env.GOOGLE_CLIENT_SECRET === 'string' &&
    process.env.GOOGLE_CLIENT_SECRET.length > 0;

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: 'postgresql',
    }),
    trustedOrigins: [process.env.BETTER_AUTH_URL ?? 'http://localhost:3000'],
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        async sendResetPassword({ user, url }) {
            // Replace this with your real email provider integration.
            console.info(`[Better Auth] Password reset for ${user.email}: ${url}`);
        },
    },
    emailVerification: {
        async sendVerificationEmail({ user, url }) {
            // Replace this with your real email provider integration.
            console.info(`[Better Auth] Verify email for ${user.email}: ${url}`);
        },
    },
    socialProviders: hasGoogleOAuth
        ? {
            google: {
                clientId: process.env.GOOGLE_CLIENT_ID as string,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            },
        }
        : {},
    plugins: [twoFactor(), admin(), bearer(), nextCookies()],
});

export type Session = typeof auth.$Infer.Session;