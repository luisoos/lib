'use server';

// Dependencies
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Image from 'next/image';

// Server Communication
import { env } from '~/env';
import { getServerSideSession } from '~/server/auth';
import { authConfig } from '~/server/auth/config';

// UI
// Components
import SignInButton from '~/components/auth/buttons/signin';
import EmailLogin from '~/components/auth/buttons/email';
import Error from '~/components/auth/Error';
// Icons
import favicon from 'public/favicon.ico';

export default async function SignIn() {
    const session = await getServerSideSession();
    if (session) {
        redirect('/dashboard');
    }

    return (
        <div className='w-11/12 sm:w-72 h-screen mx-auto flex justify-center flex-col mt-[-5%]'>
            <Image
                src={favicon}
                alt={env.NEXT_PUBLIC_PROJECT_NAME}
                className='mx-auto w-24'
            />
            <h2 className='mb-6 font-extrabold text-2xl text-center'>
                {env.NEXT_PUBLIC_PROJECT_NAME}{' '}
            </h2>
            <Error />
            <p className='mb-2 text-md'>Already a user?</p>
            <EmailLogin />
            {authConfig.providers &&
                authConfig.providers[0]?.name.toLowerCase() !== 'email' && (
                    <div className='flex mt-4 mb-3'>
                        <hr className='w-full my-auto border-zinc-200' />
                        <p className='w-full h-min px-4 text-nowrap text-zinc-500'>
                            or register & sign in with
                        </p>
                        <hr className='w-full my-auto border-zinc-200' />
                    </div>
                )}
            {authConfig.providers
                .filter((item) => item.name.toLowerCase() !== 'email')
                .map((item) => (
                    <div key={item.name}>
                        <SignInButton
                            provider={item.name}
                            icon={item.name.toLowerCase()}
                        />
                    </div>
                ))}
        </div>
    );
}
