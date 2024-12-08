import { z } from 'zod';
import { createClient } from '~/utils/supabase/server';
import { env } from '~/env';
import { getProfile } from '~/server/api/user';
import { SupabaseClient } from '@supabase/supabase-js';
import { ExtendedFileObject } from '~/types/files/structure';
import { validateFileOwnership } from '~/server/api/shared/validateFileOwnership';
import { FileContentOrSignedUrl, Metadata } from '~/types/files/db';
import { ServerActionResponse, UploadData } from '~/types/api/response';
import { FileObject, StorageError } from '@supabase/storage-js';
import { getUserByUploadSecret } from './uploadsecret';

export async function getStructure(): Promise<
    ServerActionResponse<ExtendedFileObject[]>
> {
    // Get supabase client
    const supabase = createClient();
    // Fetch authenticated user
    const user = await getProfile();
    if (!user) return { data: null, error: 'Unauthorized', status: 401 };
    const userId = user.id;

    const structure = await listFilesInFolder(supabase, userId);
    if (structure instanceof StorageError)
        return {
            data: null,
            error: structure,
            status: 500,
        };
    return { data: structure, error: null, status: 200 };
}

async function listFilesInFolder(
    supabase: SupabaseClient<any, string, any>,
    path: string,
): Promise<ExtendedFileObject[] | StorageError> {
    const { data: files, error } = await supabase.storage
        .from(env.SUPABASE_BUCKET_NAME)
        .list(path, {
            limit: 100, // Adjust limit as needed
            sortBy: { column: 'name' },
        });

    if (error) {
        console.error('Error fetching files:', error);
        return error;
    }

    const folders: ExtendedFileObject[] = files.filter(
        (file) => file.id === null,
    );

    for (const folder of folders) {
        const nestedFiles = await listFilesInFolder(
            supabase,
            `${path}/${folder.name}`,
        );
        if (nestedFiles instanceof StorageError) return nestedFiles;
        if (!folder.sub) folder.sub = [];
        folder.sub.push(...nestedFiles);
    }

    const allFiles: ExtendedFileObject[] = [...files];

    return allFiles;
}

export async function getFileById(
    fileId: string,
): Promise<ServerActionResponse<FileContentOrSignedUrl>> {
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

        if (storageError ?? !fileContent)
            return {
                data: null,
                error: storageError,
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
            fileName: objectData.path_tokens[objectData.path_tokens.length - 1],
            ...objectData.metadata,
        };
    }

    return { data, error, status: 200 };
}

// Function to upload a file
export async function uploadFile(
    fileName: string,
    fileType: string,
    fileData: string,
    folderName: string | undefined,
    upsert?: true | undefined,
): Promise<ServerActionResponse<UploadData>> {
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

    const { data, error } = await supabase.storage
        .from(env.SUPABASE_BUCKET_NAME)
        .upload(
            `${userId}/${folder}${fileName.normalize('NFD').replace(/[\u0300-\u036f]/g, '')}`,
            buffer.toString(),
            {
                contentType: fileType,
                upsert: upsert || (fileName === 'New Note.txt' ? false : true),
            },
        );

    if (error) {
        if (error.message.includes('ResourceAlreadyExists')) {
            return {
                data,
                error: 'There already is a resource at given file path',
                status: 409,
            };
        } else {
            return {
                data,
                error: error,
                status: 500,
            };
        }
    }
    return { data, error, status: 200 };
}

// Function to upload a file from a uploader
export async function uploadFileFromUploader(
    file: Buffer,
    uploadSecret: string,
    fileName: string,
    fileType: string,
): Promise<{ uploadedFileName: string; fileUrl: string }> {
    const uploadFolerName: string = 'uploads';

    // Get supabase client and parameters
    const supabase = createClient();

    // Get user by upload secret
    const user = await getUserByUploadSecret(uploadSecret);
    if (!user.data)
        throw new Error('Upload secret invalid or does not match our records.');
    const userId = user.data.userId;

    // Set folder
    const folder: string = uploadFolerName + '/';

    // Create timestamp so that the file name is unqiue
    const timestamp = new Date().toISOString().replace(/[:.-]/g, '');

    // Generate file name and file path
    const generatedFileName = `${timestamp}_${fileName.normalize('NFD').replace(/[\u0300-\u036f]/g, '')}`;
    const filePath = `${userId}/${folder}/${generatedFileName}`;

    const { data, error } = await supabase.storage
        .from(env.SUPABASE_BUCKET_NAME)
        .upload(filePath, file, {
            contentType: fileType,
            upsert: false,
        });

    if (error) throw error;

    const { data: signedUrl, error: storageError } = await supabase.storage
        .from(env.SUPABASE_BUCKET_NAME)
        .createSignedUrl(filePath, user.data.urlExpiresIn);

    if (storageError) throw storageError;

    return {
        uploadedFileName: generatedFileName,
        fileUrl: signedUrl.signedUrl,
    };
}

// Function to update a file
export async function updateNote(
    fileName: string,
    fileId: string,
    fileData: string | undefined,
    upsert: boolean = false,
): Promise<ServerActionResponse<UploadData>> {
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
            error: 'There is no file with the given `fileId`',
            status: 404,
        };
    if (userId !== folder[0])
        return {
            data: null,
            error: 'Unauthorized',
            status: 401,
        };
    // Save the original file path to work with the other variable; using `.join()` here
    // is crucial: otherwise we would have to explicitly freeze it here, because the new
    // variable would just point to the original variable and thus also contain changes
    // we make to the latter in the upcoming steps.
    const oldFilePath: string = folder.join('/');
    // Check if the file name was not changed (if request and server-side filename are the same)
    const fileNameNotChanged = folder[folder.length - 1] === fileName;

    if (fileData) {
        // `fileData` is set; there is a change in the note body
        // Decode the base64 file data
        content = fileData;
    } else if (fileNameNotChanged) {
        // `fileData` is not set and the name of the note was not changed (Nothing to update)
        return {
            data: null,
            error: '`fileData` is undefined and the `fileName` is the same',
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
                    error: 'File should only be renamed but could not be retrieved',
                    status: 400,
                };
            // Decode the base64 file data
            content = oldFile.data.fileContent;
        }
    }

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
            error: 'Internal error while preparing Supabase transaction',
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
                    error: 'There already is a resource at given file path',
                    status: 409,
                };
            } else {
                return {
                    data: null,
                    error: uploadError,
                    status: 500,
                };
            }
        }

        let removeError;
        if (!fileNameNotChanged && upsert) {
            const { data: removeData, error: deleteFileError } =
                await supabase.storage
                    .from(env.SUPABASE_BUCKET_NAME)
                    .remove([oldFilePath]);
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

// Function to delete a file
export async function deleteFile(
    fileId: string,
): Promise<ServerActionResponse<FileObject[]>> {
    // Get supabase client and parameters
    const supabase = createClient('storage');
    // Fetch authenticated user
    const user = await getProfile();
    if (!user) return { data: null, error: 'Unauthorized', status: 401 };
    const userId = user.id;

    const path = await getPathTokens(supabase, fileId);
    if (!Array.isArray(path))
        return {
            data: null,
            error: 'There is no file with the given `fileId`',
            status: 404,
        };
    if (userId !== path[0])
        return {
            data: null,
            error: 'Unauthorized',
            status: 401,
        };

    try {
        const { data: removeData, error: deleteFileError } =
            await supabase.storage
                .from(env.SUPABASE_BUCKET_NAME)
                .remove([path.join('/')]);
        return {
            data: removeData,
            error: deleteFileError,
            status: deleteFileError ? 500 : 200,
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
