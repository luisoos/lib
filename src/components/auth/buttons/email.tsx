'use client';

import { Label } from '~/components/ui/label';
import SignInButton from './signin';
import { Input } from '~/components/ui/input';
import { useState } from 'react';

export default function EmailLogin() {
    const [email, setEmail] = useState('');

    return (
        <>
            <div className='grid w-full md:max-w-sm mb-1 items-center gap-1.5'>
                <Label htmlFor='email'>E-mail</Label>
                <Input
                    type='email'
                    id='email'
                    placeholder='E-mail'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <SignInButton
                provider='Email'
                options={{ email: email }}
                icon='Mail'
            />
        </>
    );
}
