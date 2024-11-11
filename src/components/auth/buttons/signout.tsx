'use client';

import { signOut } from 'next-auth/react';
import { Button } from '~/components/ui/button';

export default async function SignOutButton() {
    return (
        <Button variant='link' onClick={() => signOut()}>
            Log out
        </Button>
    );
}
