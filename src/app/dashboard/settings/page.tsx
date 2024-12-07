'use client';

import { UploadCloud } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '~/components/ui/button';
import { Heading, Subheading, Title } from '~/components/ui/dashboard/heading';
import { Skeleton3 } from '~/components/ui/skeleton';
import { useToast } from '~/hooks/use-toast';

export default function Page() {
    const { toast } = useToast();

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
            toast({
                variant: 'destructive',
                title: 'Failed to generate upload secret.',
            });
        }

        const responseData = await response.json();
        setUploadSecret(responseData.data.secret);
        setLoading(false);
    };

    const handleDelete = async () => {
        const response = await fetch(`/api/routes/user/uploadsecret`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            toast({
                variant: 'destructive',
                title: 'Failed to delete upload secret.',
            });
        }

        setUploadSecret(null);
        setLoading(false);
    };

    const copyToClipboard = async () => {
        if (!uploadSecret) return;
        try {
            await navigator.clipboard.writeText(uploadSecret);
            toast({
                title: 'Copied upload secret to your clipboard!',
            });
        } catch (err) {
            toast({
                variant: 'destructive',
                title: 'Failed to copy upload secret.',
            });
        }
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
                <div className='mt-2 mb-1 w-full'>
                    {!loading ? (
                        <>
                            {uploadSecret ? (
                                <p
                                    className='mb-4 cursor-pointer break-all blur-sm hover:blur-none transition-all'
                                    onClick={async () =>
                                        await copyToClipboard()
                                    }>
                                    {uploadSecret}
                                </p>
                            ) : (
                                <p className='text-zinc-600'>
                                    You do not have an upload secret at the
                                    moment.
                                </p>
                            )}
                            <div className='flex'>
                                <Button
                                    type='button'
                                    onClick={async () => {
                                        await handleGenerate();
                                    }}>
                                    {uploadSecret
                                        ? 'Regenerate Secret'
                                        : 'Generate Secret'}
                                </Button>
                                {uploadSecret && (
                                    <Button
                                        type='button'
                                        variant='destructive'
                                        className='ml-2'
                                        onClick={async () => {
                                            await handleDelete();
                                        }}>
                                        Delete Secret
                                    </Button>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <Skeleton3 />
                            <div className='flex mt-2'>
                                <Skeleton3 className='h-8 w-24' />
                                <Skeleton3 className='ml-2 h-8 w-24' />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
