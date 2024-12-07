import { NextResponse } from 'next/server';
import { z } from 'zod';
import { uploadFile, uploadFileFromUploader } from '~/server/api/files';

// Define the maximum file size in bytes
const MAX_FILE_SIZE_MEGABYTES: number = 16;
const MAX_FILE_SIZE: number = MAX_FILE_SIZE_MEGABYTES * 1024 * 1024; // 16 MB

// Define the schema for validation
const uploadSchema = z
    .object({
        file: z
            .instanceof(File)
            .optional()
            .refine(
                (file) => {
                    if (!file) return true; // If no file, skip validation
                    return file.size > 0 && file.size <= MAX_FILE_SIZE;
                },
                {
                    message: `File must be provided, cannot be empty, and must not exceed ${MAX_FILE_SIZE_MEGABYTES} MB.`,
                },
            ),
        text: z
            .string()
            .optional()
            .refine((val) => val === undefined || val.length > 0, {
                message: 'Text must be provided if given.',
            }),
    })
    .refine((data) => data.file || data.text, {
        message: 'Either a file or text must be provided.',
    });

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

    // Extracting file and text from formData
    const file = formData.get('file');
    const text = formData.get('text');

    // Validate the incoming data using Zod
    const validationResult = uploadSchema.safeParse({ file, text });

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

    const { uploadedFileName, fileUrl } = await uploadFileFromUploader(
        (file ?? text) as File,
        uploadToken,
    );

    return NextResponse.json({
        success: true,
        file: {
            url: fileUrl,
            name: uploadedFileName,
        },
    });
}
