import { NextRequest, NextResponse } from 'next/server';
import getFileUrl from '~/hooks/files/getFileUrl';
import { getStructure, uploadFile } from '~/server/api/files';

export async function GET() {
    const structure = await getStructure();
    return NextResponse.json(structure);
}

export async function POST(request: NextRequest, response: NextResponse) {
    try {
        const body = await request.json();
        const data = await uploadFile(body);
        if (data?.error) {
            return NextResponse.json({ success: false, data }, { status: 500 });
        } else {
            const url = request.nextUrl.clone();
            url.pathname =
                'dashboard/' +
                getFileUrl(data!.data!.path.split('/').slice(1).join('/'));
            return NextResponse.redirect(url);
            // return NextResponse.json({ success: true, data });
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to upload file' },
            { status: 500 },
        );
    }
}
