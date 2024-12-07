'use client';

import { UploadCloud } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '~/components/ui/button';
import { Heading, Subheading, Title } from '~/components/ui/dashboard/heading';
import { Skeleton2 } from '~/components/ui/skeleton';

export default function Page() {
    const [uploadSecret, setUploadSecret] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUploadSecret = async () => {
            const response = await fetch(`/api/routes/user/uploadsecret`);
            if (response.ok) {
                const responseData = await response.json();
                console.log(responseData);
                setUploadSecret(responseData.data.secret);
            }
            setLoading(false);
        };

        fetchUploadSecret();
    }, []);

    const handleGenerate = async () => {
        setLoading(true);
        const response = await fetch(`/api/routes/user/uploadsecret`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to generate upload secret');
        }

        const responseData = await response.json();
        setUploadSecret(responseData.data.secret);
        setLoading(false);
    };

    return (
        <>
            <Title>Settings</Title>
            <div className='max-w-2xl p-4 rounded border shadow-inner'>
                <Heading>
                    <UploadCloud size={20} className='mr-2' /> Uploader Settings
                </Heading>
                <Subheading>
                    Generate an upload secret and configuration files for ShareX
                    upload.
                </Subheading>
                <div className='mt-2 w-full'>
                    {!loading ? (
                        <>
                            {uploadSecret ? (
                                /* TODO: Onclick: copy to clipboard */
                                <p className='pb-4 break-all blur-sm hover:blur-none'>
                                    {uploadSecret}
                                </p>
                            ) : (
                                <p className='text-zinc-600'>
                                    You do not have an upload secret at the
                                    moment.
                                </p>
                            )}
                            <Button
                                type='button'
                                onClick={async () => {
                                    await handleGenerate();
                                }}>
                                {uploadSecret ? 'Regenerate' : 'Generate'}
                                {/* TODO: add delete button */}
                            </Button>
                        </>
                    ) : (
                        <></>
                    )}
                </div>
            </div>
        </>
    );
}
