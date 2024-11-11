'use client';

import { signIn } from 'next-auth/react';
import { DynamicIcon, LucideIconName } from '~/hooks/icons';
import { Button } from '~/components/ui/button';

export default function SignInButton({
    provider,
    options,
    icon,
}: {
    provider: string;
    options?: { email: string };
    icon?: string;
}) {
    return (
        <Button
            className='w-full my-1'
            onClick={() => signIn(provider.toLocaleLowerCase(), options)}>
            {icon && <DynamicIcon name={icon as LucideIconName} />}{' '}
            {provider == 'Email'
                ? 'Send Magic Link'
                : `Sign in with ${provider}`}
        </Button>
    );
}
