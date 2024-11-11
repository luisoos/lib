import { PrismaAdapter } from '@auth/prisma-adapter';
import { Session, type DefaultSession } from 'next-auth';
import { Adapter, AdapterUser } from 'next-auth/adapters';
import Email from 'next-auth/providers/email';
import GitHub from 'next-auth/providers/GitHub';
import { env } from 'process';

import { db } from '~/server/db';
import { resend } from '~/server/email';
import { getUserByEmail } from '../api/user';

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module 'next-auth' {
    interface Session extends DefaultSession {
        user: {
            id: string;
            // ...other properties
            // role: UserRole;
        } & DefaultSession['user'];
    }

    // interface User {
    //   // ...other properties
    //   // role: UserRole;
    // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
    callbacks: {
        async session({ session, token, user }: { session: Session, token: any, user: AdapterUser }) {
            // Attach the user ID from the token to the session object
            if (token) {
                session.user.id = token.id; // Attach user ID to session
            }
            return session;
        },
    },
    adapter: PrismaAdapter(db) as Adapter,
    providers: [
        GitHub({
            clientId: env.AUTH_GITHUB_ID!,
            clientSecret: env.AUTH_GITHUB_SECRET!,
        }),
        Email({
            from: 'onboarding@resend.dev',
            maxAge: 60 * 60,
            // sendVerificationRequest: await sendVerificationEmail,
            sendVerificationRequest: async ({ identifier, url, provider }) => {
                const { host } = new URL(url);

                try {
                    const user = await getUserByEmail({
                        email: identifier,
                    });
                    const username = user ? user.name : identifier;

                    await resend.emails.send({
                        from: provider.from,
                        to: identifier,
                        subject: `Sign in to ${host}`,
                        html: `
              <body>
                <b>Welcome back ${username}!</b>
                <br>
                <p>
                  <a href="${url}">Sign in by clicking this link.</a> 
                  The link expires in one hour.
                </p>
                <p>Thank you for using ${env.NEXT_PUBLIC_PROJECT_NAME}.</p>
              </body>
            `,
                    });
                } catch (error) {
                    console.error('Error sending verification email', error);
                    throw new Error('Failed to send verification email');
                }
            },
        }),
    ],
    pages: {
        signIn: '/auth/signin',
        signOut: '/auth/signout',
        error: '/auth/signin', // Error code passed in query string as ?error=
        verifyRequest: '/auth/verify-request', // (used for check email message)
        newUser: '/dashboard', // New users will be directed here on first sign in (leave the property out if not of interest)
    },
};
