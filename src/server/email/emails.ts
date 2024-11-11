import { env } from "process";
import { resend } from ".";
import type { SendVerificationRequestParams } from "next-auth/providers/email";
import { createCaller } from "../api/root";
import { createContext } from "~/trpc/server";

export async function sendVerificationEmail({ identifier, url, provider }: SendVerificationRequestParams) {
    const { host } = new URL(url);
    const api = createCaller(createContext);

    try {
        const user = await api.user.getUserByEmail({
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
}