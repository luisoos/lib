import { NextRequest, NextResponse } from 'next/server';
import getFileUrl from '~/hooks/files/getFileUrl';
import { getStructure, uploadFile } from '~/server/api/files';

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
        const data = await uploadFile(body); // Upload the file using provided data

        if (data?.error) {
            return NextResponse.json({ success: false, data }, { status: 500 });
        } else {
            const url = request.nextUrl.clone();
            url.pathname = getFileUrl(
                data!.data!.path.split('/').slice(1).join('/'),
                true,
            );
            return NextResponse.redirect(url); // Redirect to the uploaded file's URL
            // return NextResponse.json({ success: true, data });
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to upload file' },
            { status: 500 },
        );
    }
}
