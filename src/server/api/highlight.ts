import { createClient } from '~/utils/supabase/server'; // Adjust import based on your setup
import { getProfile } from './user';
import { SupabaseClient } from '@supabase/supabase-js';
import { db } from '~/server/db';
import { z } from 'zod';
import { DatabaseHighlights } from '~/types/files/highlights';
import { CommentedHighlight } from '~/types/files/pdf';
import { validateFileOwnership } from './shared/validateFileOwnership';

// Define Zod schema for highlight creation
export const highlightSchema = z.object({
    title: z.string(),
    description: z.string().optional(),
    storageObjectId: z.string(),
    highlightData: z.record(z.unknown()),
});

// Function to create a highlight
export async function createHighlight(body: any) {
    const parsedInput = highlightSchema.parse(body); // Use the new schema

    const user = await getProfile();
    if (!user) return null;

    const supabase = createClient('storage');
    const validation = await validateFileOwnership(
        supabase,
        parsedInput.storageObjectId,
        user.id,
    );

    if (!validation) {
        console.error('User does not own the file.');
        return null; // Optionally handle unauthorized access
    }

    const highlight = await db.highlight.create({
        data: {
            title: parsedInput.title,
            description: parsedInput.description,
            storageObjectId: parsedInput.storageObjectId,
            data: JSON.stringify(parsedInput.highlightData),
        },
    });

    return highlight;
}

// Function to update a highlight (only description is allowed to be updated)
export async function updateHighlight(id: number, newDescription: string) {
    const user = await getProfile();
    if (!user) return null;

    const supabase = createClient('storage');

    // Fetch the current highlight to validate ownership
    const highlight = await db.highlight.findUnique({
        where: { id },
    });

    if (!highlight) {
        console.error('Highlight not found.');
        return null;
    }

    const validation = await validateFileOwnership(
        supabase,
        highlight.storageObjectId,
        user.id,
    );

    if (!validation) {
        console.error('User does not own the file.');
        return null; // Optionally handle unauthorized access
    }

    // Update only the description
    const updatedHighlight = await db.highlight.update({
        where: { id },
        data: { description: newDescription },
    });

    return updatedHighlight;
}

// Function to delete a highlight
export async function deleteHighlight(id: number) {
    const user = await getProfile();
    if (!user) return null;

    const supabase = createClient('storage');

    // Fetch the current highlight to validate ownership
    const highlight = await db.highlight.findUnique({
        where: { id },
    });

    if (!highlight) {
        console.error('Highlight not found.');
        return null;
    }

    const validation = await validateFileOwnership(
        supabase,
        highlight.storageObjectId,
        user.id,
    );

    if (!validation) {
        console.error('User does not own the file.');
        return null; // Optionally handle unauthorized access
    }

    // Delete the highlight
    await db.highlight.delete({
        where: { id },
    });

    return { success: true };
}

// Function to get a specific highlight by ID
export async function getHighlightById(id: number) {
    const highlight = await db.highlight.findUnique({
        where: { id },
    });

    if (!highlight) {
        console.error('Highlight not found.');
        return null;
    }

    return mapHighlights(highlight);
}

// Function to get all highlights for a specific file
export async function getAllHighlightsForFile(fileId: string) {
    const highlights = await db.highlight.findMany({
        where: { storageObjectId: fileId },
    });

    return mapHighlights(highlights);
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
