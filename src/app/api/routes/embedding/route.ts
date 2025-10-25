import { NextRequest, NextResponse } from "next/server";
import { getUnanalysedFiles } from "~/server/api/files";

export async function POST(
    request: NextRequest,
) {
    try {
        const body = await request.json(); // Parse the JSON body of the request

        // Get all documents having no document analysis
        const { data: unanalysedFiles, error: unanalysedFilesError, status: unanalysedFilesStatus } = await getUnanalysedFiles();

        if (unanalysedFilesError || unanalysedFilesStatus !== 200) {
            return NextResponse.json(
                { success: false, error: unanalysedFilesError || 'Failed to fetch unanalysed files' },
                { status: unanalysedFilesStatus || 500 }, // Internal Server Error
            );
        }

        if (!unanalysedFiles || unanalysedFiles.length === 0) {
            return NextResponse.json(
                { success: true, message: 'No unanalysed files found' },
                { status: 200 }, // OK status
            );
        }

        // Loop
            // Compare hashes

            // IF hash unchanged: SKIP (continue)

            // Generate embeddings

            // Delete old file analysis

            // Save embeddings and new hash of document

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
    