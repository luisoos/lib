import NextAuth, { getServerSession } from 'next-auth';
import { cache } from 'react';

import { authConfig } from '~/server/auth/config';

const { auth: uncachedAuth, handlers, signIn, signOut } = NextAuth(authConfig);

const auth = cache(uncachedAuth);

export { auth, handlers, signIn, signOut };

export const getServerSideSession = () => getServerSession(authConfig);