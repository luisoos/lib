import { NextResponse } from 'next/server';
import { uploadFile, uploadFileFromUploader } from '~/server/api/files';

// Define the maximum file size in bytes
const MAX_FILE_SIZE_MEGABYTES: number = 16;
const MAX_FILE_SIZE: number = MAX_FILE_SIZE_MEGABYTES * 1024 * 1024; // 16 MB
// Define allowed file types
const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain',
];

export async function POST(req: Request) {
    const authHeader = req.headers.get('Authorization');

    if (!authHeader) {
        return NextResponse.json(
            { success: false, message: 'Authorization header missing' },
            { status: 401 },
        );
    }

    const uploadToken = authHeader.replace('Bearer ', '');

    const formData = await req.formData();

    // Extracting file from formData
    const file = formData.get('d') as Blob | undefined;
    const text = formData.get('text')?.toString();

    if (!file && !text) {
        return NextResponse.json(
            {
                status: 'fail',
                message: 'No file provided',
            },
            { status: 400 },
        );
    }

    if (file) {
        // Check file size and type
        if (
            file.size > MAX_FILE_SIZE ||
            !ALLOWED_MIME_TYPES.includes(file.type)
        ) {
            return NextResponse.json(
                {
                    status: 'fail',
                    message: `Invalid file: size must not exceed ${MAX_FILE_SIZE_MEGABYTES} MB and type must be one of ${ALLOWED_MIME_TYPES.join(', ')}`,
                },
                { status: 400 },
            );
        }
    }

    try {
        let fileName;
        let fileType;
        let fileBuffer;

        if (file) {
            fileName = (formData.get('d') as any).name || 'upload.file';
            fileType = file.type;
            fileBuffer = Buffer.from(await file.arrayBuffer());
        } else if (text) {
            fileName = text.slice(0, 2);
            fileType = 'text/plain';
            fileBuffer = Buffer.from(text);
        }

        const { uploadedFileName, fileUrl } = await uploadFileFromUploader(
            fileBuffer!,
            uploadToken,
            fileName!,
            fileType!,
        );

        return new NextResponse(fileUrl, {
            status: 200,
            headers: {
                'Content-Type': 'text/plain',
            },
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : 'Internal server error',
            },
            { status: 500 },
        );
    }
}
