export interface Metadata {
    eTag: string;
    size: number;
    mimetype: string;
    cacheControl: string;
    lastModified: string;
    contentLength: number;
    httpStatusCode: number;
}

export type FileContentOrSignedUrl = fileContentData | SignedUrlData | null;

type fileContentData = { fileContent: string; metadata: Record<string, any> };
type SignedUrlData = {
    signedUrl: string;
    fileName: string;
    metadata: Record<string, any>;
};
