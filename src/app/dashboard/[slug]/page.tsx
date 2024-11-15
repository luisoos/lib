// Page.tsx
import { NextResponse } from 'next/server';
import RenderFile from '~/components/ui/file'; // Adjust import path as necessary

export default async function Page({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const slug = (await params).slug;
    if (!slug) return <div>Error: Bad request</div>;

    return (
        <div className='px-4 h-full'>
            <h1>My Post: {slug}</h1>
            <RenderFile slug={slug} />
        </div>
    );
}
