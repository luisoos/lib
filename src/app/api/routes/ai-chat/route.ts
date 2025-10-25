import Groq from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';
import z from 'zod';
import { getServerSideSession } from '~/server/auth';
import { db } from '~/server/db';
import { updateOrCreateAiChat } from '~/server/services/ai-chat';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const MessageSchema = z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
});

const messageSchema = z.object({
    aiChatId: z.string().optional(),
    messageHistory: z.array(MessageSchema).default([]),
    message: z.string(),
});

export async function GET(request: NextRequest, response: NextResponse) {
    try {
        const session = await getServerSideSession();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 },
            );
        }

        const params = request.nextUrl.searchParams;
        const limit = params.get('limit') || '10';
        const offset = params.get('offset') || '0';

        if (Number(limit) < 1) {
            return NextResponse.json(
                { error: 'Invalid limit' },
                { status: 400 },
            );
        }
        if (Number(offset) < 0) {
            return NextResponse.json(
                { error: 'Invalid offset' },
                { status: 400 },
            );
        }

        const aiChats = await db.aiChat.findMany({
            where: { userId: session.user.id },
            orderBy: { updatedAt: 'desc' },
            take: Number(limit),
            skip: Number(offset),
        });

        const totalCount = await db.aiChat.count({
            where: { userId: session.user.id },
        });

        return NextResponse.json(
            { aiChats },
            {
                headers: {
                    'X-Has-More': (
                        Number(offset) + Number(limit) <
                        totalCount
                    ).toString(),
                },
            },
        );
    } catch (error) {
        console.error('API Error:', error);
        return new NextResponse(
            JSON.stringify({
                error: 'Internal Error',
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            },
        );
    }
}

export async function POST(request: NextRequest, response: NextResponse) {
    try {
        const session = await getServerSideSession();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 },
            );
        }

        const data = await request.json();
        const parsed = messageSchema.safeParse(data);

        if (!parsed.success || !parsed.data.message) {
            return NextResponse.json(
                { error: 'Invalid request data' },
                { status: 400 },
            );
        }

        let stream;
        try {
            stream = await groq.chat.completions.create({
                messages: [
                    ...parsed.data.messageHistory,
                    { role: 'user', content: parsed.data.message },
                ],
                model: 'openai/gpt-oss-120b',
                stream: true,
                max_tokens: 3072,
                temperature: 0.7,
            });
        } catch (groqError) {
            console.error('Groq API error:', groqError);
            return NextResponse.json(
                { error: 'AI service unavailable' },
                { status: 503 },
            );
        }

        const responseStream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                let fullResponse: string = '';

                try {
                    for await (const chunk of stream) {
                        const content = chunk.choices[0]?.delta?.content;

                        if (content) {
                            fullResponse += content;
                            controller.enqueue(encoder.encode(content));
                        }
                    }
                } catch (error) {
                    console.error('Streaming error:', error);
                    controller.error(error);
                } finally {
                    const savedChat = await updateOrCreateAiChat({
                        userId: session.user.id,
                        newMessages: [
                            { role: 'user', content: parsed.data.message },
                            { role: 'assistant', content: fullResponse },
                        ],
                        aiChatId: parsed.data.aiChatId,
                    });

                    const metadata = `\n__CHAT_ID__:${savedChat.id}`;
                    controller.enqueue(encoder.encode(metadata));

                    controller.close();
                }
            },
        });

        return new NextResponse(responseStream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
            },
        });
    } catch (error) {
        console.error('API Error:', error);
        return new NextResponse(
            JSON.stringify({
                error: 'Internal Error',
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            },
        );
    }
}
