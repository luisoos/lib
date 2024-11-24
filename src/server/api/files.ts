import { z } from 'zod';
import { createClient } from '~/utils/supabase/server';
import { env } from '~/env';
import { getProfile } from '~/server/api/user';
import { SupabaseClient } from '@supabase/supabase-js';
import { ExtendedFileObject } from '~/types/files/structure';
import { validateFileOwnership } from '~/server/api/shared/validateFileOwnership';
import { FileContentOrSignedUrl, Metadata } from '~/types/files/db';

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
    let error: any | typeof metadataError | null = null;
    let data: FileContentOrSignedUrl = null;

    // Retrieve the metadata of the file
    const { data: objectData, error: metadataError } = await supabase
        .from('objects')
        .select('metadata, path_tokens')
        .eq('id', fileId)
        .single();

    if (!objectData || !objectData.metadata || metadataError)
        return {
            data: null,
            error: metadataError,
            status: 500,
        };

    if ((objectData.metadata as Metadata).mimetype.startsWith('text/plain')) {
        const { data: fileContent, error: storageError } =
            await supabase.storage
                .from(env.SUPABASE_BUCKET_NAME)
                .download(path);

        if (!fileContent || storageError)
            return {
                data: null,
                error: 'Error downloading file.',
                status: 500,
            };

        data = {
            fileContent: await fileContent?.text(),
            fileName: objectData.path_tokens[objectData.path_tokens.length - 1],
            ...objectData.metadata,
        };
    } else {
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

        data = {
            signedUrl: signedUrl.signedUrl,
            ...objectData.metadata,
        };
    }

    return { data, error };
}

// Function to upload a file
export async function uploadFile(
    fileName: string,
    fileType: string,
    fileData: string,
    folderName: string | undefined,
    upsert?: true | undefined,
) {
    // Get supabase client and parameters
    const supabase = createClient();
    // Fetch authenticated user
    const user = await getProfile();
    if (!user)
        return {
            data: null,
            error: 'Unauthorized',
            status: 401,
        };
    const userId = user.id;

    // Set folder
    const folder: string = folderName ? folderName + '/' : '';

    // Decode the base64 file data
    const buffer = Buffer.from(fileData, 'base64');

    console.log(buffer.toString());

    try {
        const { data, error } = await supabase.storage
            .from(env.SUPABASE_BUCKET_NAME)
            .upload(
                `${userId}/${folder}${fileName.normalize('NFD').replace(/[\u0300-\u036f]/g, '')}`,
                buffer.toString(),
                {
                    contentType: fileType,
                    upsert:
                        upsert || (fileName === 'New Note.txt' ? false : true),
                },
            );

        if (error) {
            if (error.message.includes('ResourceAlreadyExists')) {
                return {
                    data,
                    error: 'There already is a resource at given file path.',
                    status: 409,
                };
            } else {
                return {
                    data,
                    error: error.message,
                    status: 500,
                };
            }
        }
        return { data, error };
    } catch (error) {
        console.log(error);
    }
}

// Function to update a file
export async function updateNote(
    fileName: string,
    fileId: string,
    fileData: string | undefined,
    upsert: boolean = false,
) {
    // Get supabase client and parameters
    const supabase = createClient('storage');
    // Fetch authenticated user
    const user = await getProfile();
    if (!user) return { data: null, error: 'Unauthorized', status: 401 };
    const userId = user.id;

    let content: string | undefined;
    const folder = await getPathTokens(supabase, fileId);
    if (!Array.isArray(folder))
        return {
            data: null,
            error: 'There is no file with the given `fileId`.',
            status: 404,
        };
    const fileNameNotChanged = folder[folder.length - 1] === fileName;

    if (fileData) {
        // `fileData` is set; there is a change in the note body
        // Decode the base64 file data
        content = fileData;
    } else if (fileNameNotChanged) {
        // `fileData` is not set and the name of the note was not changed (Nothing to update)
        return {
            data: null,
            error: '`fileData` is undefined and the `fileName` is the same.',
            status: 400,
        };
    }

    // Name of the note was changed
    if (!fileNameNotChanged) {
        const oldFile = await getFileById(fileId);
        // Only `fileName` was submitted, thus only the name should be changed;
        // we know this, because `buffer` must be set otherwise
        if (!content) {
            // Error handling in case the old file could not be found
            if (!oldFile.data || oldFile.error || 'signedUrl' in oldFile.data)
                return {
                    data: null,
                    error: 'File should only be renamed but could not be retrieved.',
                    status: 400,
                };
            // Decode the base64 file data
            content = oldFile.data.fileContent;
        }
    }
    // TODO add validation

    // Set new filename & path
    folder[folder.length - 1] = fileName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
    const newPath: string = folder.join('/');

    // Because either the filename or the body has to be set, this is just to
    // make sure we don't get a type error when uploading the file to Supabase
    // Storage
    if (!content)
        return {
            data: null,
            error: 'Internal error while preparing Supabase transaction.',
            status: 500,
        };

    try {
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from(env.SUPABASE_BUCKET_NAME)
            .upload(newPath, content, {
                upsert: upsert,
            });

        if (uploadError) {
            if ((uploadError as any).error.includes('Duplicate')) {
                return {
                    data: null,
                    error: 'There already is a resource at given file path.',
                    status: 409,
                };
            } else {
                return {
                    data: null,
                    error: uploadError.message,
                    status: 500,
                };
            }
        }

        let removeError;
        if (!fileNameNotChanged && upsert) {
            const { data: removeData, error: deleteFileError } =
                await supabase.storage
                    .from(env.SUPABASE_BUCKET_NAME)
                    .remove([folder.join('/')]);
            removeError = deleteFileError;
        }
        return {
            data: uploadData,
            error: uploadError,
            status: !fileNameNotChanged && !removeError ? 301 : 200,
            revalidate: !fileNameNotChanged ? 'redirect' : 'sidebar',
        };
    } catch (error: any) {
        console.log(error);
        return { data: null, error: error, status: error.status ?? 500 };
    }
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
        if (error.details.includes('The result contains 0 rows')) return 404;
        console.error('Error fetching path tokens:', error);
        throw new Error('Failed to fetch path tokens');
    }

    return data?.path_tokens; // Return only the path_tokens field or undefined if not found
}
