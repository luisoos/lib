'use server';

import SignOutButton from '~/components/auth/buttons/signout';

export default async function SignIn() {
    return (
        <div className='w-11/12 md:w-56 h-fit mx-auto my-auto'>
            <SignOutButton />
        </div>
    );
}
