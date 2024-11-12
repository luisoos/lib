// ~/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { authConfig } from '~/server/auth/config'; // Adjust the import path as necessary

const handler = NextAuth(authConfig);

export { handler as GET, handler as POST };
