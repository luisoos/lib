import { z } from 'zod';
import { createClient } from '~/utils/supabase/server'; // Adjust import based on your setup
import { env } from '~/env'; // Adjust import based on your environment setup
import { getProfile } from './user';
import { SupabaseClient } from '@supabase/supabase-js';
import { ExtendedFileObject } from '~/types/files/structure';
import { db } from '~/server/db';
import { validateFileOwnership } from './shared/validateFileOwnership';

// Define Zod schema for input validation
const uploadFileSchema = z.object({
    fileName: z.string(),
    fileType: z.string(),
    fileData: z.string(), // Base64 encoded file data
    folderName: z.string().optional(),
});

export async function getStructure() {
    // Get supabase client
    const supabase = createClient();
    // Fetch authenticated user
    const user = await getProfile();
    if (!user) return null;
    const userId = user.id;
    return listFilesInFolder(supabase, userId);
}

async function listFilesInFolder(
    supabase: SupabaseClient<any, string, any>,
    path: string,
) {
    const { data: files, error } = await supabase.storage
        .from(env.SUPABASE_BUCKET_NAME)
        .list(path, {
            limit: 100, // Adjust limit as needed
            sortBy: { column: 'name' },
        });

    if (error) {
        console.error('Error fetching files:', error);
        return [];
    }

    const folders: ExtendedFileObject[] = files.filter(
        (file) => file.id === null,
    );

    for (const folder of folders) {
        const nestedFiles = await listFilesInFolder(
            supabase,
            `${path}/${folder.name}`,
        );
        if (!folder.sub) folder.sub = [];
        folder.sub.push(...nestedFiles);
    }

    const allFiles: ExtendedFileObject[] = [...files];

    return allFiles;
}

export async function getFileById(fileId: string) {
    // Get supabase client
    const supabase = createClient('storage');

    // Validate user access
    const user = await getProfile();
    if (!user)
        return {
            data: null,
            error: 'Unauthorized',
            status: 401,
        };
    const validation = await validateFileOwnership(supabase, fileId, user.id);

    if (!validation)
        return {
            data: null,
            error: 'Unauthorized',
            status: 401,
        };

    // Get path by getting the storage object from the database
    const pathResponse = await getPathTokens(supabase, fileId);
    if (!pathResponse || !pathResponse)
        return {
            data: null,
            error: 'Could not find file or corresponding path',
            status: 404,
        };
    const path = pathResponse.join('/');

    // Define types for the response
    let error: typeof storageError | typeof metadataError | null = null;
    let data: { signedUrl: string; metadata: typeof metadata } | null = null;

    // Create a signed URL for the file that is valid for one minute
    const { data: signedUrl, error: storageError } = await supabase.storage
        .from(env.SUPABASE_BUCKET_NAME)
        .createSignedUrl(path, 60);

    if (!signedUrl || !signedUrl.signedUrl || storageError)
        return {
            data: null,
            error: storageError,
            status: 500,
        };

    // Retrieve the metadata of the file
    const { data: metadata, error: metadataError } = await supabase
        .from('objects')
        .select('metadata')
        .eq('id', fileId)
        .single();

    if (!metadata || !metadata.metadata || metadataError)
        return {
            data: null,
            error: metadataError,
            status: 500,
        };

    data = {
        signedUrl: signedUrl.signedUrl,
        ...metadata.metadata,
    };

    return { data, error };
}

async function getPathTokens(
    supabase: SupabaseClient<any, string, any>,
    fileId: string,
) {
    const { data, error } = await supabase
        .from('objects') // Specify the table name
        .select('path_tokens') // Select only the path_tokens field
        .eq('id', fileId) // Filter by id
        .single(); // Expect a single record

    if (error) {
        console.error('Error fetching path tokens:', error);
        throw new Error('Failed to fetch path tokens');
    }

    return data?.path_tokens; // Return only the path_tokens field or undefined if not found
}

// Function to upload a file
export async function uploadFile(body: any) {
    // Validate input using Zod
    const parsedInput = uploadFileSchema.parse(body);

    // Get supabase client and parameters
    const supabase = createClient();
    const { fileName, fileType, fileData, folderName } = parsedInput;
    // Fetch authenticated user
    const user = await getProfile();
    if (!user) return null;
    const userId = user.id;

    // Set folder
    const folder: string = folderName ? folderName + '/' : '';

    // Decode the base64 file data
    const buffer = Buffer.from(fileData, 'base64');

    try {
        const { data, error } = await supabase.storage
            .from(env.SUPABASE_BUCKET_NAME)
            .upload(
                `${userId}/${folder}${fileName.normalize('NFD').replace(/[\u0300-\u036f]/g, '')}`,
                buffer,
                {
                    contentType: fileType,
                    upsert: true,
                },
            );
        console.log(error);
        return { data, error };
    } catch (error) {
        console.log(error);
    }
}

export const files = { getStructure, getFileById, uploadFile };
