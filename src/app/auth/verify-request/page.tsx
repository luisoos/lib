import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function verifyRequest() {
    return (
        <div className='w-11/12 sm:w-72 h-screen mx-auto flex justify-center flex-col mt-[-5%] text-center'>
            <h2 className='font-extrabold text-2xl'> Check your email </h2>
            <p className='mt-2 text-md'>
                A sign in link has been sent to your email address.
            </p>
            <p className='mt-4 mx-auto flex opacity-80 font-semibold'>
                <ArrowLeft className='w-5' />{' '}
                <Link href='/'>Return to homepage</Link>
            </p>
        </div>
    );
}
