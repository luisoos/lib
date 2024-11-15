import { NextRequest, NextResponse } from 'next/server';
import { files } from '~/server/api/files';

export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string } },
) {
    const slug = params.slug;
    if (!slug)
        return NextResponse.json(
            { success: false, error: 'Bad request' },
            { status: 400 },
        );
    const file = await files.getFileById(slug);
    if (file.error)
        return NextResponse.json(
            { success: false, error: file.error },
            { status: file.status ?? 400 },
        );

    return NextResponse.json(
        { success: true, data: await file.data!.text(), type: file.data!.type },
        { status: 200 },
    );
}
