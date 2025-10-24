import { getServerSession } from 'next-auth';
import { authConfig } from '~/server/auth/config';

export const getServerSideSession = () => getServerSession(authConfig);