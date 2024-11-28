import { createClient } from '~/utils/supabase/server';
import { getProfile } from '~/server/api/user';
import { db } from '~/server/db';
import { z } from 'zod';
import { DatabaseHighlights } from '~/types/files/highlights';
import { CommentedHighlight } from '~/types/files/pdf';
import { validateFileOwnership } from '~/server/api/shared/validateFileOwnership';
import { ServerActionResponse } from '~/types/api/response';
import { JsonValue } from '@prisma/client/runtime/library';

// Define Zod schema for highlight creation
export const highlightSchema = z.object({
    title: z.string(),
    description: z.string().optional(),
    storageObjectId: z.string(),
    highlightData: z.record(z.unknown()),
});

// Function to create a highlight
export async function createHighlight(body: any): Promise<
    ServerActionResponse<{
        title: string;
        description: string | null;
        storageObjectId: string;
        data: JsonValue;
    }>
> {
    const parsedInput = highlightSchema.parse(body); // Use the new schema

    const user = await getProfile();
    if (!user) return { data: null, error: 'Unauthorized', status: 401 };

    const supabase = createClient('storage');
    const validation = await validateFileOwnership(
        supabase,
        parsedInput.storageObjectId,
        user.id,
    );

    if (!validation) {
        return { data: null, error: 'Unauthorized', status: 401 };
    }

    const highlight = await db.highlight.create({
        data: {
            title: parsedInput.title,
            description: parsedInput.description,
            storageObjectId: parsedInput.storageObjectId,
            data: JSON.stringify(parsedInput.highlightData),
        },
    });

    return { data: highlight, error: null, status: 401 };
}

// Function to update a highlight (only description is allowed to be updated)
export async function updateHighlight(
    id: number,
    newDescription: string,
): Promise<
    ServerActionResponse<{
        title: string;
        description: string | null;
        storageObjectId: string;
        data: JsonValue;
    }>
> {
    const user = await getProfile();
    if (!user) return { data: null, error: 'Unauthorized', status: 401 };

    const supabase = createClient('storage');

    // Fetch the current highlight to validate ownership
    const highlight = await db.highlight.findUnique({
        where: { id },
    });

    if (!highlight) {
        return { data: null, error: 'Not found', status: 404 };
    }

    const validation = await validateFileOwnership(
        supabase,
        highlight.storageObjectId,
        user.id,
    );

    if (!validation) {
        return { data: null, error: 'Unauthorized', status: 401 };
    }

    // Update only the description
    const updatedHighlight = await db.highlight.update({
        where: { id },
        data: { description: newDescription },
    });

    return { data: updatedHighlight, error: null, status: 401 };
}

// Function to delete a highlight
export async function deleteHighlight(id: number): Promise<
    ServerActionResponse<{
        title: string;
        description: string | null;
        storageObjectId: string;
        data: JsonValue;
    }>
> {
    const user = await getProfile();
    if (!user) return { data: null, error: 'Unauthorized', status: 401 };

    const supabase = createClient('storage');

    // Fetch the current highlight to validate ownership
    const highlight = await db.highlight.findUnique({
        where: { id },
    });

    if (!highlight) {
        console.error('Highlight not found.');
        return { data: null, error: 'Not found', status: 404 };
    }

    const validation = await validateFileOwnership(
        supabase,
        highlight.storageObjectId,
        user.id,
    );

    if (!validation) {
        console.error('User does not own the file.');
        return { data: null, error: 'Unauthorized', status: 401 };
    }

    // Delete the highlight
    const deletedHighlight = await db.highlight.delete({
        where: { id },
    });

    return { data: deletedHighlight, error: null, status: 200 };
}

// Function to get a specific highlight by ID
export async function getHighlightById(
    id: number,
): Promise<ServerActionResponse<CommentedHighlight[]>> {
    const highlight = await db.highlight.findUnique({
        where: { id },
    });

    if (!highlight) {
        console.error('Highlight not found.');
        return { data: null, error: 'Not found', status: 404 };
    }

    return { data: mapHighlights(highlight), error: null, status: 200 };
}

// Function to get all highlights for a specific file
export async function getAllHighlightsForFile(
    fileId: string,
): Promise<ServerActionResponse<CommentedHighlight[]>> {
    const highlights = await db.highlight.findMany({
        where: { storageObjectId: fileId },
    });

    return { data: mapHighlights(highlights), error: null, status: 200 };
}

function mapHighlights(
    highlights: DatabaseHighlights | DatabaseHighlights[],
): CommentedHighlight[] {
    const highlightsArray = Array.isArray(highlights)
        ? highlights
        : [highlights];

    return Object.values(highlightsArray).map((item) => ({
        id: item.id.toString(),
        content: {
            text: item.title, // Map title to content.text
        },
        comment: item.description ?? undefined, // Map description to comment
        position: typeof item.data === 'string' ? JSON.parse(item.data) : '', // Parse the JSON string into an object
        storageObjectId: item.storageObjectId,
    }));
}
