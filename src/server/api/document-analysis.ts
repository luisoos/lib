import { createClient } from '~/utils/supabase/server';
import { env } from '~/env';
import { getProfile } from '~/server/api/user';
import { getServerSideSession } from '../auth';
import { db } from '../db';
import { calculateDocumentHash } from '../embeds/file-hash';

async function getAuthUser() {
    const session = await getServerSideSession(); // Get session info
    if (!session || !session.user) {
        return null;
    }

    const user = await db.user.findFirst({
        where: { id: session.user.id },
    });

    return user ?? null; // Return user or null if not found
}

export async function getUnanalysedFiles() {
    // Get supabase client and parameters
    const supabase = createClient('storage');
    // Fetch authenticated user
    const user = await getAuthUser();
    if (!user) return { data: null, error: 'Unauthorized', status: 401 };
    const userId = user.id;

    // Retrieve files with a updatedAt younger than their analysis or with no analysis at all
    // Get all storage objects
    const { data: storageObjects, error: storageError } = await supabase
        .from('objects')
        .select(
            'id, name, updated_at, created_at, last_accessed_at, metadata, path_tokens, bucket_id',
        )
        .eq('bucket_id', env.SUPABASE_BUCKET_NAME)
        .like('name', `${userId}/%`)
        .order('updated_at', { ascending: false })
        .limit(1000);

    if (storageError) {
        console.error('Error fetching storage objects:', storageError);
        return { data: null, error: 'Failed to fetch files', status: 500 };
    }

    // Get all document analyses
    const { data: analyses, error: analysesError } =
        await getDocumentAnalyses(userId);

    if (analysesError) {
        console.error('Error fetching analyses:', analysesError);
        return { data: null, error: 'Failed to fetch analyses', status: 500 };
    }

    const unanalysedFiles = storageObjects
        .filter((file) => {
            // Get analysis for this file
            const analysis = analyses.find(
                (a) => a.storage_object_id === file.id,
            );

            if (!analysis) return true;

            // Check if file was updated after analysis
            const fileDate = new Date(file.updated_at);
            const analysisDate = new Date(analysis.createdAt);

            return fileDate > analysisDate;
        })
        .map((file) => ({
            ...file,
            analysisHash: analyses.find((a) => a.storage_object_id === file.id)
                ?.documentHash,
        }));

    return { data: unanalysedFiles, error: null, status: 200 };
}

async function getDocumentAnalyses(userId: string) {
    // Get supabase client and parameters
    const supabase = createClient('public');
    return await supabase
        .from('document_analyses')
        .select('storage_object_id, documentHash, createdAt')
        .eq('user_id', userId);
}

export async function compareHashes(fileName: string, analysisHash: string) {
    // Get supabase client and parameters
    const supabase = createClient('storage');
    const { data, error } = await supabase.storage
        .from(env.SUPABASE_BUCKET_NAME)
        .createSignedUrl(fileName, 60);

    if (error) {
        console.error('Error creating signed URL:', error);
        return {
            data: null,
            success: false,
            error: 'Failed to create signed URL',
        };
    }

    const response = await fetch(data.signedUrl);
    const responseCloneForHash = response.clone()
    const responseCloneForReturn = response.clone()
    const arrayBuffer = await responseCloneForHash.arrayBuffer();
    const documentHash = await calculateDocumentHash(arrayBuffer);

    return {
        data: {
            hashesMatch: analysisHash === documentHash,
            fileResponse: responseCloneForReturn,
        },
        success: true,
    };
}
