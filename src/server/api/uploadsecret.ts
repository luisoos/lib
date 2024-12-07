import useRandom from '~/hooks/use-random';
import { getProfile } from '~/server/api/user';
import { db } from '~/server/db';
import { ServerActionResponse } from '~/types/api/response';

export async function getUploadSecret(): Promise<
    ServerActionResponse<typeof uploadSecret>
> {
    const user = await getProfile();
    if (!user) return { data: null, error: 'Unauthorized', status: 401 };
    const userId = user.id;

    const uploadSecret = await db.uploadSecret.findUnique({
        where: {
            userId: userId,
        },
    });

    if (!uploadSecret) return { data: null, error: 'Not found', status: 404 };
    return { data: uploadSecret, error: null, status: 200 };
}

export async function generateUploadSecret(): Promise<
    ServerActionResponse<typeof uploadSecret>
> {
    const user = await getProfile();
    if (!user) return { data: null, error: 'Unauthorized', status: 401 };
    const userId = user.id;

    try {
        await findAndDeleteUploadSecret(userId);
    } catch (error) {
        return { data: null, error: 'Internal error', status: 500 };
    }

    const uploadSecret = await db.uploadSecret.create({
        data: {
            secret: useRandom(128),
            userId: userId,
        },
    });
    if (!uploadSecret) return { data: null, error: 'Not found', status: 404 };
    return { data: uploadSecret, error: null, status: 201 };
}

export async function deleteUploadSecret(): Promise<
    ServerActionResponse<null>
> {
    const user = await getProfile();
    if (!user) return { data: null, error: 'Unauthorized', status: 401 };
    const userId = user.id;

    try {
        await findAndDeleteUploadSecret(userId);
        return { data: null, error: null, status: 200 };
    } catch (error) {
        return {
            data: null,
            error: 'Failed to delete upload secret',
            status: 500,
        };
    }
}

async function findAndDeleteUploadSecret(userId: string) {
    // Find the upload secret by user ID
    const uploadSecret = await db.uploadSecret.findUnique({
        where: {
            userId: userId,
        },
    });

    if (uploadSecret) {
        // Delete the upload secret
        await db.uploadSecret.delete({
            where: {
                id: uploadSecret.id, // Use the ID of the found upload secret
            },
        });
    }
}
