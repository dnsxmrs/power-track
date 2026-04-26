import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { admin } from 'better-auth/plugins/admin';
import { bearer } from 'better-auth/plugins/bearer';
import { twoFactor } from 'better-auth/plugins/two-factor';
import { emailOTP } from 'better-auth/plugins';
import { prisma } from './prisma';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

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
    plugins: [
        twoFactor(),
        admin(),
        bearer(),
        nextCookies(),
        emailOTP({
            async sendVerificationOTP({ email, otp, type }) {
                if (type === "forget-password") {
                    const user = await prisma.user.findUnique({
                        where: { email },
                    });
                    
                    if (!user) {
                        console.warn(`[Better Auth] Forget password OTP requested for non-existent email: ${email}`);
                        throw new Error("User Not Found");
                    }

                    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
                        try {
                            const info = await transporter.sendMail({
                                from: process.env.SMTP_FROM || '"PowerTrack" <powertracking.services@gmail.com>',
                                to: email,
                                subject: 'Reset Your Password',
                                html: `<p>Your password reset code is: <strong>${otp}</strong></p><p style="color:#888;font-size:13px;">This code expires in <strong>5 minutes</strong>. If you did not request this, you can safely ignore this email.</p>`,
                            });
                            
                            console.info(`[Better Auth] OTP sent via Nodemailer to ${email}. Message ID: ${info.messageId}`);
                            // We still log the OTP here just in case it doesn't arrive during testing
                            console.info(`[Better Auth] For testing, your OTP is: ${otp}`);
                        } catch (error) {
                            console.error(`[Better Auth] Failed to execute Nodemailer for ${email}:`, error);
                            console.info(`[Better Auth] Fallback: Password reset OTP for ${email}: ${otp}`);
                        }
                    } else {
                        console.info(`[Better Auth] Nodemailer not fully configured (missing SMTP vars).`);
                        console.info(`[Better Auth] Password reset OTP for ${email}: ${otp}`);
                    }
                } else {
                     console.info(`[Better Auth] OTP for ${email} (type: ${type}): ${otp}`);
                }
            },

            otpLength: 6,
        }),
    ],
});

export type Session = typeof auth.$Infer.Session;