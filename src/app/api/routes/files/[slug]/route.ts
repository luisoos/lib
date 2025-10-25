import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import validateQuery from '~/hooks/validateQuery';
import {
    deleteFile,
    getFileById,
    updateFilename,
    updateNote,
} from '~/server/api/files';
import { db } from '~/server/db';

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
 * It expects the ID to be provided as a URL parameter and the updated file data in the request body.
 *
 * @async
 * @function PUT
 * @param {NextRequest} request - The incoming request object containing the request details.
 * @param {Object} params - An object containing route parameters.
 * @param {string} params.id - The ID of the file to be updated.
 * @returns {Promise<NextResponse>} A promise that resolves to a NextResponse object indicating success or failure of the update operation.
 *
 * @throws {Error} If there's an issue updating the file or if the provided ID is invalid.
 *
 * @example
 * // Example usage in a client-side fetch:
 * fetch(`/api/routes/files/${fileId}?upsert=${true}`, {
 *   method: 'PUT',
 *   headers: {
 *     'Content-Type': 'application/json'
 *   },
 *   body: JSON.stringify(updatedFileData)
 * })
 * .then(response => {
 *     if (response.ok) {
 *         return response.json();
 *     }
 *     throw new Error('Failed to update file');
 * })
 * .then(data => console.log('File updated successfully:', data))
 * .catch(error => console.error('Error:', error));
 *
 * @see {@link files.updateFileById} for the implementation of updating a file by its ID.
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

        const note = await updateNote(
            fileName,
            slug,
            parsedData.fileData,
            upsert,
        );

        if (!note.data || note.error) {
            return NextResponse.json(
                { success: false, error: note.error },
                { status: note.status ?? 500 }, // Internal Server Error
            );
        }

        return NextResponse.json(
            { success: true, data: note.data },
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

/**
 * API Endpoint to update a filename by its ID
 *
 * This function handles PATCH requests to update a specific file identified by its ID.
 * It expects the ID to be provided as a URL parameter and the updated file name with extension in the request body.
 *
 * @async
 * @function PATCH
 * @param {NextRequest} request - The incoming request object containing the request details.
 * @param {Object} params - An object containing route parameters.
 * @param {string} params.id - The ID of the file to be updated.
 * @returns {Promise<NextResponse>} A promise that resolves to a NextResponse object indicating success or failure of the update operation.
 *
 * @throws {Error} If there's an issue updating the file or if the provided ID is invalid.
 *
 * @example
 * // Example usage in a client-side fetch:
 * fetch(`/api/routes/files/${fileId}?upsert=${true}`, {
 *   method: 'PATCH',
 *   headers: {
 *     'Content-Type': 'application/json'
 *   },
 *   body: JSON.stringify(updatedFileData)
 * })
 * .then(response => {
 *     if (response.ok) {
 *         return response.json();
 *     }
 *     throw new Error('Failed to update file');
 * })
 * .then(data => console.log('File updated successfully:', data))
 * .catch(error => console.error('Error:', error));
 *
 * @see {@link files.updateFileById} for the implementation of updating a file by its ID.
 */

export async function PATCH(
    request: NextRequest,
    { params }: { params: { slug: string } },
): Promise<NextResponse> {
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
        const fileName = parsedData.fileName;

        const note = await updateFilename(fileName, slug, upsert);

        if (!note.data || note.error) {
            return NextResponse.json(
                { success: false, error: note.error },
                { status: note.status ?? 500 }, // Internal Server Error
            );
        }

        return NextResponse.json(
            { success: true, data: note.data },
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

/**
 * API Endpoint to delete a file by its ID
 *
 * This function handles DELETE requests to remove a specific file identified by its ID.
 * It expects the ID to be provided as a URL parameter.
 *
 * @async
 * @function DELETE
 * @param {NextRequest} request - The incoming request object containing the request details.
 * @param {Object} params - An object containing route parameters.
 * @param {string} params.id - The ID of the file to be deleted.
 * @returns {Promise<NextResponse>} A promise that resolves to a NextResponse object indicating success or failure of the deletion operation.
 *
 * @throws {Error} If there's an issue deleting the file or if the provided ID is invalid.
 *
 * @example
 * // Example usage in a client-side fetch:
 * fetch(`/api/routes/files/${fileId}`, {
 *   method: 'DELETE'
 * })
 * .then(response => {
 *     if (response.ok) {
 *         return response.json();
 *     }
 *     throw new Error('Failed to delete file');
 * })
 * .then(data => console.log('File deleted successfully:', data))
 * .catch(error => console.error('Error:', error));
 *
 * @see {@link files.deleteFileById} for the implementation of deleting a file by its ID.
 */

export async function DELETE(
    request: NextRequest,
    { params }: { params: { slug: string } },
) {
    try {
        const id = params.slug;
        if (!id)
            return NextResponse.json(
                { success: false, error: 'Bad request' },
                { status: 400 },
            );

        // Call your delete function here, e.g., deleteFileById
        const result = await deleteFile(id);

        if (!result.data || result.error) {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: result.status ?? 500 }, // Internal Server Error
            );
        }

        const analysisDeletionResult = await db.documentAnalysis.deleteMany({
            where: {
                storage_object_id: id,
            },
        });

        // deleteMany returns a BatchPayload with a `count` property — no `error` field
        if (typeof analysisDeletionResult.count !== 'number') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Failed to delete document analysis records',
                },
                { status: 500 }, // Internal Server Error
            );
        }

        return NextResponse.json(
            { success: true, message: 'File deleted successfully' },
            { status: 200 }, // OK status
        );
    } catch (error) {
        console.error('Error deleting file:', error);

        return NextResponse.json(
            { success: false, error: 'Failed to delete file' },
            { status: 500 }, // Internal Server Error
        );
    }
}
