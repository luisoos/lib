// Dependencies
import Link from 'next/link';

// Server Communication
import { env } from '~/env';

// UI
// Icons
import { ArrowRight } from 'lucide-react';
import { getServerSideSession } from '~/server/auth';


export default async function Home() {
    const session = await getServerSideSession();

    return (
        <>
            <main className='flex min-h-screen flex-col items-center justify-center'>
                <div className='container flex flex-col items-center justify-center gap-12 px-4 py-16'>
                    <div className='flex flex-col items-center gap-2'>
                        <p className='text-4xl font-extrabold'>
                            Chat with your notes.
                        </p>
                        <p className='text-center text-xl'>
                            <span className='font-mono'>
                                {env.NEXT_PUBLIC_PROJECT_NAME}{' '}
                            </span>
                            lets you chat with all of your documents at once.
                            <br />
                            Import <b>PDFs</b>, <b>GoodNotes</b> & other
                            documents and write <b>Notion-like notes</b>.
                        </p>
                        <p className='mt-4 mx-auto flex opacity-80 font-semibold'>
                            <Link
                                href={session ? '/dashboard' : '/auth/signin'}>
                                {session ? 'Dashboard' : 'Start for free'}
                            </Link>
                            <ArrowRight className='w-5' />
                        </p>
                    </div>
                </div>
            </main>
        </>
    );
}
