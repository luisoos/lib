import { NextRequest, NextResponse } from 'next/server';
import { getServerSideSession } from '~/server/auth';
import { db } from '~/server/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const session = await getServerSideSession();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 },
            );
        }

        const { id } = await params;
        const chat = await db.aiChat.findUnique({
            where: { userId: session.user.id, id: id },
        });

        return NextResponse.json(chat);
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

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const session = await getServerSideSession();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 },
            );
        }

        const { id } = await params;
        const chat = await db.aiChat.delete({
            where: { userId: session.user.id, id: id },
        });

        return NextResponse.json(
            { message: 'Successfully deleted chat.' },
            { status: 200 },
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
