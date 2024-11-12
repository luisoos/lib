import { FileObject } from '@supabase/storage-js';

export interface ExtendedFileObject extends FileObject {
    sub?: FileObject[]; // Optional property of type FileObject
}
