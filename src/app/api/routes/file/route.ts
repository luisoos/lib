import { NextRequest, NextResponse } from 'next/server';
import { files } from '~/server/api/files';

export async function GET(request: NextRequest, response: NextResponse) {
    const searchParams = request.nextUrl.searchParams;
    const slug = searchParams.get('slug');
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
        { success: true, data: file.data },
        { status: 200 },
    );
}
