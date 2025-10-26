import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import getFileUrl from '~/hooks/files/getFileUrl';
import validateQuery from '~/lib/validateQuery';
import { getStructure, uploadFile } from '~/server/api/files';
import { ErrorMessage } from '~/types/api/response';

const uploadFileSchema = z.object({
    fileName: z.string(),
    fileType: z.string().refine(
        (type) => {
            const allowedTypes = [
                'image/jpeg',
                'image/png',
                'image/webp',
                'application/pdf',
                'text/plain',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/json',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-powerpoint',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'text/html',
            ];
            return allowedTypes.includes(type);
        },
        { message: 'Unsupported file type' } as ErrorMessage,
    ),
    fileData: z.string(),
    folderName: z.string().optional(),
});

/**
 * API Endpoint to retrieve the file structure
 *
 * This function handles GET requests to fetch the current file structure.
 * It retrieves the structure of files and directories from the server.
 *
 * @async
 * @function GET
 * @returns {Promise<NextResponse>} A promise that resolves to a NextResponse object containing the file structure in JSON format.
 *
 * @example
 * // Example usage in a client-side fetch:
 * fetch('/api/files', { method: 'GET' })
 *   .then(response => response.json())
 *   .then(structure => console.log(structure))
 *   .catch(error => console.error('Failed to fetch file structure:', error));
 */
export async function GET() {
    const structure = await getStructure();
    return NextResponse.json(structure);
}

/**
 * API Endpoint to upload a file
 *
 * This function handles POST requests to upload a new file to the server.
 * It expects the request body to contain the necessary data for the file upload.
 *
 * @async
 * @function POST
 * @param {NextRequest} request - The incoming request object containing the file data in JSON format.
 * @param {NextResponse} response - The response object (not used in this implementation).
 * @returns {Promise<NextResponse>} A promise that resolves to a NextResponse object
 *
 * @throws {Error} If there's an issue uploading the file or if an error occurs during processing.
 *
 * @example
 * // Example usage in a client-side fetch:
 * fetch('/api/files', {
 *   method: 'POST',
 *   headers: {
 *     'Content-Type': 'application/json',
 *   },
 *   body: JSON.stringify({
 *     // File data goes here (e.g., name, content, etc.)
 *   }),
 * })
 * .then(response => {
 *     if (response.ok) {
 *         return response.json();
 *     }
 *     throw new Error('Failed to upload file');
 * })
 * .then(data => console.log(data))
 * .catch(error => console.error('Error:', error));
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json(); // Parse the JSON body of the request
        let parsedData;
        try {
            parsedData = uploadFileSchema.parse(body);
        } catch (error) {
            const validationError = error as z.ZodError;
            return NextResponse.json(
                { success: false, error: validationError.errors },
                { status: 400 },
            );
        }

        const url = new URL(request.url);
        const upsert = Boolean(
            validateQuery(url.searchParams.get('upsert'))
                ? url.searchParams.get('upsert')
                : false,
        );

        const file = await uploadFile(
            parsedData.fileName,
            parsedData.fileType,
            parsedData.fileData,
            parsedData.folderName,
            upsert ? upsert : undefined,
        ); // Upload the file using provided data

        if (!file.data || file.error) {
            return NextResponse.json(
                { success: false, error: file.error },
                { status: file.status ?? 500 },
            );
        } else {
            const url = request.nextUrl.clone();
            url.pathname = getFileUrl(
                file!.data!.path.split('/').slice(1).join('/'),
                true,
            );
            // return NextResponse.redirect(url); // Redirect to the uploaded file's URL
            return NextResponse.json({ success: true, data: file.data });
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to upload file' },
            { status: 500 },
        );
    }
}
