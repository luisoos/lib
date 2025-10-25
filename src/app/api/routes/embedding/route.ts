import { NextRequest, NextResponse } from "next/server";
import { compareHashes, getUnanalysedFiles } from "~/server/api/document-analysis";
import { processDocument } from "~/server/embeds/process-document";

export async function POST(
    request: NextRequest,
) {
    try {
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
        for (const file of unanalysedFiles) {
            // Compare hashes
            const {data, success} = await compareHashes(
                file.name,
                file.analysisHash || '',
            );

            if (!success || !data) continue;

            const { hashesMatch, signedFileUrl } = data;

            // IF hash unchanged: SKIP (continue)
            if (hashesMatch) continue;

            // Generate embeddings
            const embeddings = await processDocument(signedFileUrl, file.metadata.mimetype);
            console.log(embeddings)
            // Delete old file analysis

            // Save embeddings and new hash of document
        }

        return NextResponse.json(
            { success: true, message: 'Files embedded successfully' },
            { status: 200 }, // OK status
        );
    } catch (error) {
        console.error('Error embedding all files:', error);

        return NextResponse.json(
            { success: false, error: 'Failed to embed' },
            { status: 500 }, // Internal Server Error
        );
    }
}
    