import { AiChat, Prisma } from '@prisma/client';
import { db } from '~/server/db';
import { Message } from '~/types/ai-chat';

export async function updateOrCreateAiChat({
    userId,
    newMessages,
    aiChatId,
}: {
    userId: string;
    newMessages: Message[];
    aiChatId?: string;
}): Promise<AiChat> {
    if (aiChatId) {
        // Update existing chat
        const existingChat = await db.aiChat.findUnique({
            where: { id: aiChatId, userId },
        });

        if (existingChat) {
            const currentMessages =
                existingChat.messages as unknown as Message[];
            const updatedMessages = [...currentMessages, ...newMessages];

            return await db.aiChat.update({
                where: { id: aiChatId },
                data: {
                    messages: updatedMessages as unknown as Prisma.JsonArray,
                    updatedAt: new Date(),
                },
            });
        }
    }

    // Create new chat
    return await db.aiChat.create({
        data: {
            userId,
            messages: newMessages as unknown as Prisma.JsonArray,
        },
    });
}

export async function getAiChat({
    id,
    userId,
}: {
    id: string;
    userId: string;
}): Promise<AiChat | null> {
    return await db.aiChat.findUnique({
        where: { id, userId },
    });
}

export async function deleteAiChat({
    id,
    userId,
}: {
    id: string;
    userId: string;
}): Promise<AiChat> {
    return await db.aiChat.delete({
        where: { id, userId },
    });
}

export async function getAiChats({
    userId,
    limit = 10,
    offset = 0,
}: {
    userId: string;
    limit?: number;
    offset?: number;
}): Promise<AiChat[]> {
    return await db.aiChat.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: limit,
        skip: offset,
    });
}
