import { NextRequest, NextResponse } from 'next/server';
import { getProfile, getUserByEmail } from '~/server/api/user';

/**
 * API Endpoint to get the profile of the authenticated user
 *
 * This function handles GET requests to retrieve the user's profile.
 * It assumes that authentication has already been handled by middleware
 * or another mechanism before this function is called.
 *
 * @async
 * @function GET
 * @returns {Promise<NextResponse>} A promise that resolves to a NextResponse object
 *
 * @throws {Error} If there's an issue retrieving the profile or if the user is not authenticated
 *
 * @example
 * // Example usage in a client-side fetch:
 * fetch('/api/routes/user', { method: 'GET' })
 *   .then(response => response.json())
 *   .then(profile => console.log(profile))
 *   .catch(error => console.error('Failed to fetch profile:', error));
 *
 * @see {@link getProfile} for the implementation of profile retrieval
 */
export async function GET() {
    try {
        const profile = await getProfile();
        return NextResponse.json(profile);
    } catch (error) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
}

/**
 * API Endpoint to retrieve a user by their email address
 *
 * This function handles POST requests to fetch user information based on the provided email.
 * It expects a JSON payload in the request body containing an email address.
 *
 * @async
 * @function POST
 * @param {NextRequest} request - The incoming request object
 * @returns {Promise<NextResponse>} A promise that resolves to a NextResponse object
 *
 * @throws {Error} If there's an issue parsing the request body or retrieving the user
 *
 * @example
 * // Example usage in a client-side fetch:
 * fetch('/api/routes/user', {
 *   method: 'POST',
 *   headers: {
 *     'Content-Type': 'application/json',
 *   },
 *   body: JSON.stringify({ email: 'user@example.com' }),
 * })
 *   .then(response => response.json())
 *   .then(user => console.log(user))
 *   .catch(error => console.error('Failed to fetch user:', error));
 *
 * @see {@link getUserByEmail} for the implementation of user retrieval by email
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Handle the body input
        if (!body.email || typeof body.email !== 'string') {
            return NextResponse.json(
                {
                    error: 'Bad request',
                    message: 'Invalid or missing email in request body',
                },
                { status: 400 },
            );
        }
        const parsedInput = {
            email: body.email.trim().toLowerCase(),
        };

        // Retrieve the user
        const user = await getUserByEmail({ email: parsedInput.email });

        if (!user) {
            return NextResponse.json(
                {
                    error: 'Not Found',
                    message: 'User not found with the provided email',
                },
                { status: 404 },
            );
        }

        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json(
            { error: 'Bad request', message: 'Failed to process the request' },
            { status: 400 },
        );
    }
}
