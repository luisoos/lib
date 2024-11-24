import { z } from 'zod';
import { db } from '~/server/db';
import { redirect } from 'next/navigation';
import { getServerSideSession } from '../auth';

// Define Zod schema for input validation
const getUserByEmailSchema = z.object({
    email: z.string().email(),
});

// Action to get the current user's profile
export async function getProfile() {
    const session = await getServerSideSession(); // Get session info
    if (!session || !session.user) {
        return redirect('auth/signin');
    }

    const user = await db.user.findFirst({
        where: { id: session.user.id },
    });

    return user ?? null; // Return user or null if not found
}

// Action to get a user by email
export async function getUserByEmail(input: { email: string }) {
    const parsedInput = getUserByEmailSchema.parse(input);

    const user = await db.user.findFirst({
        where: { email: parsedInput.email },
    });

    return user ?? null; // Return user or null if not found
}
