import { NextRequest, NextResponse } from 'next/server';
import { files } from '~/server/api/files';

/**
 * API Endpoint to retrieve a file by its slug
 *
 * This function handles GET requests to fetch a specific file identified by its slug.
 * It expects the slug to be provided as a URL parameter.
 *
 * @async
 * @function GET
 * @param {NextRequest} request - The incoming request object containing the request details.
 * @param {Object} params - An object containing route parameters.
 * @param {string} params.slug - The slug of the file to be retrieved.
 * @returns {Promise<NextResponse>} A promise that resolves to a NextResponse object containing the file data or an error message.
 *
 * @throws {Error} If there's an issue retrieving the file or if the provided slug is invalid.
 *
 * @example
 * // Example usage in a client-side fetch:
 * fetch(`/api/routes/files/${fileId}`, { method: 'GET' })
 *   .then(response => {
 *       if (response.ok) {
 *           return response.json();
 *       }
 *       throw new Error('Failed to fetch file');
 *   })
 *   .then(data => console.log(data))
 *   .catch(error => console.error('Error:', error));
 *
 * @see {@link files.getFileById} for the implementation of fetching a file by its ID.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string } },
) {
    const slug = params.slug;
    if (!slug)
        return NextResponse.json(
            { success: false, error: 'Bad request' },
            { status: 400 },
        );

    const file = await files.getFileById(slug);
    if (file.error)
        return NextResponse.json(
            { success: false, error: file.error },
            { status: file.status ?? 400 },
        );

    return NextResponse.json(
        { success: true, data: await file.data },
        { status: 200 },
    );
}
