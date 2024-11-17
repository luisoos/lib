import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
    createHighlight,
    deleteHighlight,
    getAllHighlightsForFile,
    getHighlightById,
    highlightSchema,
    updateHighlight,
} from '~/server/api/highlight'; // Adjust the import path based on your setup

const highlightUpdateSchema = z.object({
    description: z.string(),
});

/**
 * API Endpoint to create a new highlight
 *
 * This function handles POST requests to create a new highlight based on the provided data.
 * It expects the request body to contain details about the highlight, including its title,
 * description, associated file ID, and highlight data.
 *
 * @async
 * @function POST
 * @param {NextRequest} request - The incoming request object containing the highlight data in JSON format.
 * @returns {Promise<NextResponse>} A promise that resolves to a NextResponse object
 *
 * @throws {Error} If there's an issue creating the highlight or if the user is not authorized.
 *
 * @example
 * // Example usage in a client-side fetch:
 * fetch('/api/routes/highlights', {
 *   method: 'POST',
 *   headers: {
 *     'Content-Type': 'application/json',
 *   },
 *   body: JSON.stringify({
 *     highlight: {
 *       content: {
 *         text: 'This is a highlight example.'
 *       },
 *       position: {} // Highlight position data
 *     },
 *     comment: 'This is a comment for the highlight.',
 *     fileId: 'cm2ga1y0j0000f1fcebuxtqbk' // ID of the associated file
 *   }),
 * })
 * .then(response => response.json())
 * .then(data => console.log(data))
 * .catch(error => console.error('Failed to create highlight:', error));
 *
 * @see {@link createHighlight} for the implementation of highlight creation logic.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json(); // Parse the JSON body of the request

        const highlightData = highlightSchema.parse({
            title: body.highlight?.content?.text,
            description: body.comment,
            storageObjectId: body.fileId,
            highlightData: body.highlight?.position,
        });

        const highlight = await createHighlight(highlightData); // Call the createHighlight function with structured data

        if (!highlight) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'User not authorized or highlight creation failed',
                },
                { status: 403 }, // Forbidden status
            );
        }

        return NextResponse.json({ success: true, highlight }, { status: 201 }); // Created status
    } catch (error) {
        console.error('Error creating highlight:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create highlight' },
            { status: 500 }, // Internal Server Error
        );
    }
}

/**
 * API Endpoint to retrieve highlights
 *
 * This function handles GET requests to retrieve highlights based on the provided query parameters.
 * It can fetch a specific highlight by its ID or all highlights associated with a specific file ID.
 *
 * @async
 * @function GET
 * @param {NextRequest} request - The incoming request object containing query parameters for fetching highlights.
 * @returns {Promise<NextResponse>} A promise that resolves to a NextResponse object
 *
 * @throws {Error} If there's an issue retrieving highlights or if the provided parameters are invalid.
 *
 * @example
 * // Example usage in a client-side fetch for a specific highlight:
 * fetch('/api/routes/highlights?id=1', { method: 'GET' })
 *   .then(response => response.json())
 *   .then(data => console.log(data))
 *   .catch(error => console.error('Failed to fetch highlight:', error));
 *
 * // Example usage in a client-side fetch for all highlights of a specific file:
 * fetch('/api/routes/highlights?fileId=cm2ga1y0j0000f1fcebuxtqbk', { method: 'GET' })
 *   .then(response => response.json())
 *   .then(data => console.log(data))
 *   .catch(error => console.error('Failed to fetch highlights:', error));
 *
 * @see {@link getHighlightById} for the implementation of fetching a highlight by ID.
 * @see {@link getAllHighlightsForFile} for the implementation of fetching highlights by file ID.
 */
export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const idParam = url.searchParams.get('id'); // Assuming you pass ID as a query parameter

        if (idParam) {
            const id = parseInt(idParam);
            const highlight = await getHighlightById(id);

            if (!highlight) {
                return NextResponse.json(
                    { success: false, message: 'Highlight not found' },
                    { status: 404 },
                );
            }

            return NextResponse.json(
                { success: true, highlight },
                { status: 200 },
            );
        } else {
            const fileIdParam = url.searchParams.get('fileId');
            if (fileIdParam) {
                const highlights = await getAllHighlightsForFile(fileIdParam);
                return NextResponse.json(
                    { success: true, highlights },
                    { status: 200 },
                );
            }
        }

        return NextResponse.json(
            { success: false, message: 'No valid ID provided' },
            { status: 400 },
        );
    } catch (error) {
        console.error('Error retrieving highlights:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to retrieve highlights' },
            { status: 500 },
        );
    }
}

/**
 * API Endpoint to delete a highlight
 *
 * This function handles DELETE requests to remove a specific highlight identified by its ID.
 * It expects the ID to be provided as a query parameter in the request URL.
 *
 * @async
 * @function DELETE
 * @param {NextRequest} request - The incoming request object containing the ID of the highlight to be deleted.
 * @returns {Promise<NextResponse>} A promise that resolves to a NextResponse object
 *
 * @throws {Error} If there's an issue deleting the highlight or if the provided ID is invalid.
 *
 * @example
 * // Example usage in a client-side fetch:
 * fetch('/api/routes/highlights?id=1', { method: 'DELETE' })
 *   .then(response => {
 *       if (response.ok) {
 *           console.log('Highlight deleted successfully');
 *       } else {
 *           console.error('Failed to delete highlight:', response.statusText);
 *       }
 *   })
 *   .catch(error => console.error('Error:', error));
 *
 * @see {@link deleteHighlight} for the implementation of highlight deletion logic.
 */
export async function DELETE(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const idParam = url.searchParams.get('id'); // Assuming you pass ID as a query parameter

        if (!idParam) {
            return NextResponse.json(
                { success: false, message: 'ID is required' },
                { status: 400 },
            );
        }

        const id = parseInt(idParam);
        const result = await deleteHighlight(id);

        if (!result || !result.success) {
            return NextResponse.json(
                { success: false, message: 'Failed to delete highlight' },
                { status: 403 },
            );
        }

        return NextResponse.json({ success: true }, { status: 204 }); // No Content status on successful deletion
    } catch (error) {
        console.error('Error deleting highlight:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete highlight' },
            { status: 500 },
        );
    }
}

/**
 * API Endpoint to update an existing highlight
 *
 * This function handles PATCH requests to update a specific highlight identified by its ID.
 * It expects the request body to contain the new description for the highlight.
 *
 * @async
 * @function PATCH
 * @param {NextRequest} request - The incoming request object containing the ID of the highlight to be updated and the new data in JSON format.
 * @returns {Promise<NextResponse>} A promise that resolves to a NextResponse object
 *
 * @throws {Error} If there's an issue updating the highlight, if validation fails, or if the provided ID is invalid.
 *
 * @example
 * // Example usage in a client-side fetch:
 * fetch('/api/routes/highlights?id=1',  {
 *   method: 'PATCH',
 *   headers: {
 *     'Content-Type': 'application/json',
 *   },
 *   body: JSON.stringify({
 *     description: 'Updated description for the highlight.'
 *   }),
 * })
 * .then(response => {
 *     if (response.ok) {
 *         return response.json();
 *     }
 *     throw new Error('Failed to update highlight');
 * })
 * .then(data => console.log(data))
 * .catch(error => console.error('Error:', error));
 *
 * @see {@link updateHighlight} for the implementation of highlight update logic.
 */
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json(); // Parse the JSON body of the request

        // Validate the incoming data against the schema
        const parsedData = highlightUpdateSchema.parse(body);

        // Extract highlight ID from the request URL (assuming it's part of the URL)
        const url = new URL(request.url);
        const idParam = url.searchParams.get('id');

        if (!idParam) {
            return NextResponse.json(
                { success: false, message: 'Invalid ID provided' },
                { status: 400 },
            );
        }

        const id = parseInt(idParam);
        if (isNaN(id)) {
            return NextResponse.json(
                { success: false, message: 'Invalid ID provided' },
                { status: 400 },
            );
        }

        // Update the highlight with the new description
        const updatedHighlight = await updateHighlight(
            id,
            parsedData.description,
        );

        if (!updatedHighlight) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'User not authorized or highlight update failed',
                },
                { status: 403 }, // Forbidden status
            );
        }

        return NextResponse.json(
            { success: true, updatedHighlight },
            { status: 200 },
        ); // OK status
    } catch (error) {
        console.error('Error updating highlight:', error);

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
            { success: false, error: 'Failed to update highlight' },
            { status: 500 }, // Internal Server Error
        );
    }
}
