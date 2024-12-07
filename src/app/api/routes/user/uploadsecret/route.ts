import { NextRequest, NextResponse } from 'next/server';
import {
    deleteUploadSecret,
    generateUploadSecret,
    getUploadSecret,
} from '~/server/api/uploadsecret';

/**
 * API Endpoint to retrieve the upload secret for the authenticated user
 *
 * This function handles GET requests to fetch the user's upload secret.
 *
 * @async
 * @function GET
 * @returns {Promise<NextResponse>} A promise that resolves to a NextResponse object
 *
 * @throws {Error} If the user is not authenticated or if the upload secret is not found
 *
 * @example
 * // Example usage in a client-side fetch:
 * fetch('/api/routes/user/uploadsecret', { method: 'GET' })
 *   .then(response => response.json())
 *   .then(uploadSecret => console.log(uploadSecret))
 *   .catch(error => console.error('Failed to fetch upload secret:', error));
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
    const uploadSecret = await getUploadSecret();

    if (!uploadSecret.data) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(uploadSecret, { status: 200 });
}

/**
 * API Endpoint to generate a new upload secret for the authenticated user
 *
 * This function handles POST requests to create a new upload secret.
 *
 * @async
 * @function POST
 * @returns {Promise<NextResponse>} A promise that resolves to a NextResponse object
 *
 * @example
 * // Example usage in a client-side fetch:
 * fetch('/api/routes/user/uploadsecret', { method: 'POST' })
 *   .then(response => response.json())
 *   .then(uploadSecret => console.log(uploadSecret))
 *   .catch(error => console.error('Failed to generate upload secret:', error));
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        // Attempt to delete any existing upload secret before creating a new one
        const uploadSecret = await generateUploadSecret();

        return NextResponse.json(uploadSecret, { status: 201 });
    } catch (error) {
        console.error('Error generating upload secret:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

/**
 * API Endpoint to delete the existing upload secret for the authenticated user
 *
 * This function handles DELETE requests to remove the user's upload secret.
 * or another mechanism before this function is called.
 *
 * @async
 * @function DELETE
 * @returns {Promise<NextResponse>} A promise that resolves to a NextResponse object
 *
 * @example
 * // Example usage in a client-side fetch:
 * fetch('/api/routes/user/uploadsecret', { method: 'DELETE' })
 *   .then(response => response.json())
 *   .then(() => console.log('Upload secret deleted'))
 *   .catch(error => console.error('Failed to delete upload secret:', error));
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
    try {
        await deleteUploadSecret();
        return NextResponse.json(null, { status: 200 });
    } catch (error) {
        console.error('Error deleting upload secret:', error);
        return NextResponse.json(
            { error: 'Failed to delete upload secret' },
            { status: 500 },
        );
    }
}
