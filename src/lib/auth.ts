import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { admin } from 'better-auth/plugins/admin';
import { bearer } from 'better-auth/plugins/bearer';
import { twoFactor } from 'better-auth/plugins/two-factor';
import { emailOTP } from 'better-auth/plugins';
import { prisma } from './prisma';
import nodemailer from 'nodemailer';

const isProduction = process.env.NODE_ENV === 'production';
const smtpHost = process.env.SMTP_HOST?.trim() ?? '';
const smtpUser = process.env.SMTP_USER?.trim() ?? '';
const smtpPass = process.env.SMTP_PASS ?? '';
const smtpFrom = process.env.SMTP_FROM || '"PowerTrack" <powertracking.services@gmail.com>';
const parsedSmtpPort = Number(process.env.SMTP_PORT ?? '587');
const hasValidSmtpPort = Number.isInteger(parsedSmtpPort) && parsedSmtpPort > 0;
const smtpPort = hasValidSmtpPort ? parsedSmtpPort : 587;
const hasSmtpConfig = Boolean(smtpHost && smtpUser && smtpPass && hasValidSmtpPort);

if (!hasSmtpConfig) {
    console.warn('[Better Auth] SMTP is not fully configured; OTP emails will not be sent.');
}

const transporter = hasSmtpConfig
    ? nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: smtpUser,
            pass: smtpPass,
        },
    })
    : null;

function logOtpForNonProduction(email: string, otp: string, type: string) {
    if (!isProduction) {
        console.info(`[Better Auth] OTP for ${email} (type: ${type}): ${otp}`);
    }
}

const hasGoogleOAuth =
    typeof process.env.GOOGLE_CLIENT_ID === 'string' &&
    process.env.GOOGLE_CLIENT_ID.length > 0 &&
    typeof process.env.GOOGLE_CLIENT_SECRET === 'string' &&
    process.env.GOOGLE_CLIENT_SECRET.length > 0;

const getBaseUrl = () => {
    if (process.env.NODE_ENV === 'production') {
        return process.env.BETTER_AUTH_URL || 'https://power-tracking.vercel.app';
    }
    return process.env.BETTER_AUTH_URL || 'http://localhost:3000';
};

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: 'postgresql',
    }),
    baseURL: getBaseUrl(),
    trustedOrigins: [getBaseUrl()],
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
    plugins: [
        twoFactor(),
        admin(),
        bearer(),
        nextCookies(),
        emailOTP({
            async sendVerificationOTP({ email, otp, type }) {
                if (type === 'forget-password') {
                    const user = await prisma.user.findUnique({
                        where: { email },
                    });

                    if (!user) {
                        console.warn(`[Better Auth] Forget password OTP requested for non-existent email: ${email}`);
                        return;
                    }

                    if (!transporter) {
                        logOtpForNonProduction(email, otp, type);
                        return;
                    }

                    try {
                        const info = await transporter.sendMail({
                            from: smtpFrom,
                            to: email,
                            subject: 'Reset Your Password',
                            html: `<p>Your password reset code is: <strong>${otp}</strong></p><p style="color:#888;font-size:13px;">This code expires in <strong>5 minutes</strong>. If you did not request this, you can safely ignore this email.</p>`,
                        });

                        console.info(`[Better Auth] OTP sent via Nodemailer to ${email}. Message ID: ${info.messageId}`);
                        logOtpForNonProduction(email, otp, type);
                    } catch (error) {
                        console.error(`[Better Auth] Failed to execute Nodemailer for ${email}:`, error);
                        logOtpForNonProduction(email, otp, type);
                    }
                } else {
                    logOtpForNonProduction(email, otp, type);
                }
            },

            otpLength: 6,
        }),
    ],
});

export type Session = typeof auth.$Infer.Session;
