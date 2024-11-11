import { z } from 'zod';
import { getServerSession } from 'next-auth'; // Assuming you're using next-auth for session management
import { createClient } from '~/utils/supabase/server'; // Adjust import based on your setup
import { env } from '~/env'; // Adjust import based on your environment setup

// Define Zod schema for input validation
const uploadFileSchema = z.object({
    fileName: z.string(),
    fileType: z.string(),
    fileData: z.string(), // Base64 encoded file data
});

// Function to get the structure
export async function getStructure() {
    // Return the structure
    const structure = [
        {
            title: 'Deutsch',
            url: 'deutsch',
            items: [
                {
                    title: 'Heft',
                    url: '/2313123',
                    items: [
                        {
                            title: 'Heft',
                            url: '/2313123',
                            items: [
                                {
                                    title: 'Heft',
                                    url: '/2313123',
                                },
                            ],
                        },
                    ],
                },
                {
                    title: 'Klausur 1',
                    url: '/213153',
                },
            ],
        },
        {
            title: 'Mathe',
            url: 'math',
            items: [
                {
                    title: 'Heft',
                    url: '/2313123',
                    items: [
                        {
                            title: 'Heft',
                            url: '/2313123',
                            items: [
                                {
                                    title: 'Heft',
                                    url: '/2313123',
                                },
                            ],
                        },
                    ],
                },
                {
                    title: 'Klausur 1',
                    url: '/213153',
                },
            ],
        },
    ];

    return structure;
}

// Function to upload a file
export async function uploadFile(body: any) {
    const parsedInput = uploadFileSchema.parse(body); // Validate input using Zod

    const supabase = createClient();
    const { fileName, fileType, fileData } = parsedInput;

    // Decode the base64 file data
    const buffer = Buffer.from(fileData, 'base64');

    const { data, error } = await supabase.storage
        .from(env.SUPABASE_BUCKET_NAME)
        .upload(`files/${fileName}`, buffer, {
            contentType: fileType,
            upsert: true,
        });

    if (error) throw error;
}

export const files = { getStructure, uploadFile };