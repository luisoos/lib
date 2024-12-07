import { StorageError } from '@supabase/storage-js';
import { PostgrestError } from '@supabase/postgrest-js';

// If we need a new custom error message for server actions, add it to this type.
type ErrorStrings =
    | 'Unauthorized'
    | 'Not found'
    | 'There already is a resource at given file path'
    | 'There is no file with the given `fileId`'
    | '`fileData` is undefined and the `fileName` is the same'
    | 'File should only be renamed but could not be retrieved'
    | 'Internal error while preparing Supabase transaction'
    | 'Internal error'
    | 'There already is a resource at given file path'
    | 'Could not find file or corresponding path'
    | 'Failed to delete upload secret';

export type ServerActionResponse<DataType> = {
    data: null | DataType;
    error: null | ErrorStrings | StorageError | PostgrestError;
    status: number | undefined;
    revalidate?: string;
};

export type UploadData = { id: string; path: string; fullPath: string };
