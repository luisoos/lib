import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import validateQuery from '~/hooks/validateQuery';
import { getFileById, updateNote } from '~/server/api/files';

const updateFileSchema = z.object({
    fileName: z.string(), // Make fileName optional
    fileData: z.string().optional(), // Make fileData optional
});

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

    const file = await getFileById(slug);
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

/**
 * API Endpoint to update a file by its ID
 *
 * This function handles PUT requests to update a specific file identified by its ID.
 *
 * @async
 * @function PUT
 * @param {NextRequest} request - The incoming request object containing the request details.
 * @returns {Promise<NextResponse>} A promise that resolves to a NextResponse object indicating success or failure.
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: { slug: string } },
) {
    try {
        const slug = params.slug;
        if (!slug)
            return NextResponse.json(
                { success: false, error: 'Bad request' },
                { status: 400 },
            );

        const body = await request.json(); // Parse the JSON body of the request

        const url = new URL(request.url);
        const upsert = Boolean(
            validateQuery(url.searchParams.get('upsert'))
                ? url.searchParams.get('upsert')
                : false,
        );

        // Validate the incoming data against the schema
        const parsedData = updateFileSchema.parse(body);
        const fileName = !parsedData.fileName.endsWith('.txt')
            ? parsedData.fileName + '.txt'
            : parsedData.fileName;

        const data = await updateNote(
            fileName,
            slug,
            parsedData.fileData,
            upsert,
        );

        if (!data || data.error) {
            console.error(
                'Error updating file:',
                data.error || data.error.message,
            );
            return NextResponse.json(
                { success: false, error: data.error || data.error.message },
                { status: data.status ?? 500 }, // Internal Server Error
            );
        }

        return NextResponse.json(
            { success: true, data },
            { status: 200 }, // OK status
        );
    } catch (error) {
        console.error('Error updating file:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Validation failed',
                    issues: error.errors,
                },
                { status: 400 }, // Bad Request status
            );
        }

        return NextResponse.json(
            { success: false, error: 'Failed to update file' },
            { status: 500 }, // Internal Server Error
        );
    }
}
