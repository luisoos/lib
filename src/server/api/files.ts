import { z } from 'zod';
import { createClient } from '~/utils/supabase/server'; // Adjust import based on your setup
import { env } from '~/env'; // Adjust import based on your environment setup
import { getProfile } from './user';
import { SupabaseClient } from '@supabase/supabase-js';
import { ExtendedFileObject } from '~/types/files/structure';

// Define Zod schema for input validation
const uploadFileSchema = z.object({
    fileName: z.string(),
    fileType: z.string(),
    fileData: z.string(), // Base64 encoded file data
    folderName: z.string().optional(),
});

export async function getStructure() {
    // Get supabase client
    const supabase: SupabaseClient = createClient();
    // Fetch authenticated user
    const dbUser = await getProfile();
    if (!dbUser) return null;
    const userId = dbUser.id;
    return listFilesInFolder(supabase, userId);
}

async function listFilesInFolder(supabase: SupabaseClient, path: string) {
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

// Function to upload a file
export async function uploadFile(body: any) {
    // Validate input using Zod
    const parsedInput = uploadFileSchema.parse(body);

    // Get supabase client and parameters
    const supabase: SupabaseClient = createClient();
    const { fileName, fileType, fileData, folderName } = parsedInput;
    // Fetch authenticated user
    const dbUser = await getProfile();
    if (!dbUser) return null;
    const userId = dbUser.id;

    // Set folder
    const folder: string = folderName ? folderName + '/' : '';

    // Decode the base64 file data
    const buffer = Buffer.from(fileData, 'base64');

    console.log(folder);

    try {
        const { data, error } = await supabase.storage
            .from(env.SUPABASE_BUCKET_NAME)
            .upload(`${userId}/${folder}${fileName}`, buffer, {
                contentType: fileType,
                upsert: true,
            });
        if (error) {
            return error;
        } else {
            return 'ok';
        }
    } catch (error) {
        console.log(error);
    }
}

export const files = { getStructure, uploadFile };
