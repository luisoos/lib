import { NextResponse } from 'next/server';
import { z } from 'zod';
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

// Define the schema for validation
const uploadSchema = z.object({
    d: z.instanceof(Blob) /*.optional()*/,
    // text: z.string().optional(),
}); /*.refine((data) => data.d || data.text, {
    message: 'Either a file or text must be provided.',
})*/

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
    const file = formData.get('d') as Blob | null;

    const validationResult = uploadSchema.safeParse({ d: file });

    if (!validationResult.success) {
        const errors = validationResult.error.errors;
        return NextResponse.json(
            {
                status: 'fail',
                message: 'Invalid request',
                errors,
            },
            { status: 400 },
        );
    }

    const validatedData = validationResult.data;

    if (!validatedData.d) {
        return NextResponse.json(
            {
                status: 'fail',
                message: 'No file provided',
            },
            { status: 400 },
        );
    }

    // Check file size and type
    if (
        validatedData.d.size > MAX_FILE_SIZE ||
        !ALLOWED_MIME_TYPES.includes(validatedData.d.type)
    ) {
        return NextResponse.json(
            {
                status: 'fail',
                message: `Invalid file: size must not exceed ${MAX_FILE_SIZE_MEGABYTES} MB and type must be one of ${ALLOWED_MIME_TYPES.join(', ')}`,
            },
            { status: 400 },
        );
    }

    try {
        const fileName = (formData.get('d') as any).name || 'upload.file';
        const fileType = validatedData.d.type;
        const fileBuffer = Buffer.from(await validatedData.d.arrayBuffer());

        const { uploadedFileName, fileUrl } = await uploadFileFromUploader(
            fileBuffer,
            uploadToken,
            fileName,
            fileType,
        );

        console.log({ uploadedFileName, fileUrl });

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
