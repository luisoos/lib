import { Conversation } from '@prisma/client';
import { db } from '~/server/db';

export async function getAllConversations({
    userId,
}: {
    userId: string;
}): Promise<Conversation[]> {
    return await db.conversation.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
    });
}

export async function createConversation({
    userId,
    title,
}: {
    userId: string;
    title?: string;
}): Promise<Conversation> {
    return await db.conversation.create({
        data: {
            userId,
            title,
        },
    });
}

export async function updateConversation({
    id,
    title,
}: {
    id: string;
    title?: string;
}): Promise<Conversation> {
    return await db.conversation.update({
        where: { id },
        data: { title },
    });
}

export async function deleteConversation({
    id,
}: {
    id: string;
}): Promise<Conversation> {
    return await db.conversation.delete({
        where: { id },
    });
}
